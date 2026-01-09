// src/components/Admin/PendingShipmentsPage.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import './PendingShipmentsPage.css';

const PendingShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    base: '',
    airFee: '',
    clearanceFee: '',
    insurance: '',
    total: ''
  });

  // Fetch pending shipments
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError('');

        const q = query(
          collection(db, 'shipments'),
          where('status', '==', 'pending_review'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setShipments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Failed to load pending shipments:', err);
        setError('Failed to load pending shipments.');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Open quote modal
  const openQuoteModal = (shipment) => {
    setSelectedShipment(shipment);
    // Calculate default quote based on package weight and route
    const weight = parseFloat(shipment.packages?.[0]?.weight || 1.0);
    const baseRate = weight <= 2 ? 24.99 : weight <= 10 ? 49.99 : 89.99;
    const airFee = shipment.route?.airLegs?.length > 0 ? 80.00 : 0;
    const clearanceFee = shipment.packages?.some(p => p.requiresClearance) ? 45.00 : 0;
    const insurance = 10.00;

    setQuoteForm({
      base: baseRate.toFixed(2),
      airFee: airFee.toFixed(2),
      clearanceFee: clearanceFee.toFixed(2),
      insurance: insurance.toFixed(2),
      total: (baseRate + airFee + clearanceFee + insurance).toFixed(2)
    });
  };

  // Approve shipment
  const handleApprove = async () => {
    if (!selectedShipment) return;

    try {
      const total = parseFloat(quoteForm.total);
      await updateDoc(doc(db, 'shipments', selectedShipment.id), {
        status: 'quote_ready',
        quote: {
          ...quoteForm,
          total
        },
        updatedAt: serverTimestamp()
      });

      // Refresh list
      setShipments(prev => prev.filter(s => s.id !== selectedShipment.id));
      setSelectedShipment(null);
      alert(`  Shipment #${selectedShipment.id} approved and quote sent.`);
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve shipment.');
    }
  };

  // Reject shipment
  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await updateDoc(doc(db, 'shipments', id), {
        status: 'canceled',
        canceledReason: 'Rejected by admin',
        updatedAt: serverTimestamp()
      });
      setShipments(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to reject shipment.');
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get route summary
  const getRouteSummary = (route) => {
    if (!route) return '—';
    const pickup = `${route.pickup?.location || '—'} (${route.pickup?.facility || '—'})`;
    const delivery = `${route.delivery?.location || '—'} (${route.delivery?.facility || '—'})`;
    const airLegs = route.airLegs?.map(leg => `${leg.departureAirport} → ${leg.arrivalAirport}`).join(' → ') || '—';
    return `${pickup} → ${airLegs} → ${delivery}`;
  };

  // Package summary
  const getPackageSummary = (packages) => {
    if (!packages || packages.length === 0) return '—';
    return packages.map((p, i) => `${i + 1}. ${p.description} (${p.weight} kg)`).join(', ');
  };

  return (
    <div className="admin-pending-shipments">
      <div className="page-header">
        <h1>Pending Shipment Requests</h1>
        <p>Review and approve new shipment requests</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by tracking ID, name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error & Loading */}
      {error && <div className="alert error">❌ {error}</div>}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading pending shipments...</p>
        </div>
      ) : (
        <div className="shipments-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>From → To</th>
                <th>Weight</th>
                <th>Service</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No pending requests. All shipment requests have been processed.
                  </td>
                </tr>
              ) : (
                shipments.map(ship => (
                  <tr key={ship.id}>
                    <td>
                      <code>{ship.trackingNumber || ship.id.substring(0, 6)}</code>
                    </td>
                    <td>
                      {getRouteSummary(ship.route)}
                    </td>
                    <td>
                      {ship.packages?.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0).toFixed(1)} kg
                    </td>
                    <td>{ship.shipment?.serviceType || 'Standard'}</td>
                    <td>{formatDate(ship.createdAt)}</td>
                    <td>
                      <button 
                        className="btn-approve"
                        onClick={() => openQuoteModal(ship)}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(ship.id)}
                      >
                        Reject
                      </button>
                      <button 
                        className="btn-view"
                        onClick={() => setSelectedShipment(ship)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {selectedShipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>View Shipment #{selectedShipment.id}</h3>
              <button onClick={() => setSelectedShipment(null)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Client Info */}
              <div className="section">
                <h4><i className="fas fa-user"></i> Client Information</h4>
                <div className="client-info">
                  <div><strong>Name:</strong> {selectedShipment.client?.name || '—'}</div>
                  <div><strong>Email:</strong> {selectedShipment.client?.email || '—'}</div>
                  <div><strong>Phone:</strong> {selectedShipment.client?.phone || '—'}</div>
                  <div><strong>Company:</strong> {selectedShipment.client?.company || '—'}</div>
                </div>
              </div>

              {/* Package Details */}
              <div className="section">
                <h4><i className="fas fa-boxes"></i> Package Details</h4>
                {selectedShipment.packages?.map((pkg, i) => (
                  <div key={pkg.id} className="package-item">
                    <div><strong>Package {i + 1}:</strong> {pkg.description}</div>
                    <div><strong>Weight:</strong> {pkg.weight} kg</div>
                    <div><strong>Dimensions:</strong> {pkg.length} × {pkg.width} × {pkg.height} cm</div>
                    <div><strong>Category:</strong> {pkg.category}</div>
                    {pkg.requiresClearance && (
                      <div><strong>Customs:</strong> {pkg.contents || '—'}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Route Details */}
              <div className="section">
                <h4><i className="fas fa-route"></i> Route Details</h4>
                
                {/* Pickup */}
                <div className="route-leg">
                  <div className="leg-icon road"><i className="fas fa-truck"></i></div>
                  <div className="leg-content">
                    <div><strong>Pickup:</strong> {selectedShipment.route?.pickup?.location || '—'} ({selectedShipment.route?.pickup?.facility || '—'})</div>
                    <div><strong>Scheduled:</strong> {selectedShipment.route?.pickup?.scheduledTime ? formatTime(selectedShipment.route.pickup.scheduledTime) : '—'}</div>
                    <div><strong>Actual:</strong> {selectedShipment.route?.pickup?.actualTime ? formatTime(selectedShipment.route.pickup.actualTime) : '—'}</div>
                  </div>
                </div>

                {/* Air Legs */}
                {selectedShipment.route?.airLegs?.map((leg, i) => (
                  <div key={leg.id} className="route-leg">
                    <div className="leg-icon air"><i className="fas fa-plane"></i></div>
                    <div className="leg-content">
                      <div><strong>Flight {i + 1}:</strong> {leg.flightNumber || '—'} ({leg.aircraft || '—'})</div>
                      <div><strong>Departure:</strong> {leg.departureAirport || '—'} @ {leg.departureTimeScheduled ? formatTime(leg.departureTimeScheduled) : '—'}</div>
                      <div><strong>Arrival:</strong> {leg.arrivalAirport || '—'} @ {leg.arrivalTimeScheduled ? formatTime(leg.arrivalTimeScheduled) : '—'}</div>
                      {leg.departureTimeActual && (
                        <div><strong>Actual Departure:</strong> {formatTime(leg.departureTimeActual)}</div>
                      )}
                      {leg.arrivalTimeActual && (
                        <div><strong>Actual Arrival:</strong> {formatTime(leg.arrivalTimeActual)}</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Delivery */}
                <div className="route-leg">
                  <div className="leg-icon road"><i className="fas fa-truck"></i></div>
                  <div className="leg-content">
                    <div><strong>Delivery:</strong> {selectedShipment.route?.delivery?.location || '—'} ({selectedShipment.route?.delivery?.facility || '—'})</div>
                    <div><strong>Scheduled:</strong> {selectedShipment.route?.delivery?.scheduledTime ? formatTime(selectedShipment.route.delivery.scheduledTime) : '—'}</div>
                    <div><strong>Actual:</strong> {selectedShipment.route?.delivery?.actualTime ? formatTime(selectedShipment.route.delivery.actualTime) : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="section">
                <h4><i className="fas fa-info-circle"></i> Shipment Details</h4>
                <div className="shipment-details">
                  <div><strong>Priority:</strong> {selectedShipment.shipment?.priority || 'Medium'}</div>
                  <div><strong>Insurance:</strong> {selectedShipment.shipment?.insurance ? 'Yes' : 'Yes'}</div>
                  <div><strong>Signature Required:</strong> {selectedShipment.shipment?.signatureRequired ? 'Yes' : 'No'}</div>
                  <div><strong>Instructions:</strong> {selectedShipment.shipment?.instructions || '—'}</div>
                </div>
              </div>

              {/* Quote Section */}
              <div className="section">
                <h4><i className="fas fa-tag"></i> Quote</h4>
                <div className="quote-form">
                  <div className="form-row">
                    <label>Base Rate</label>
                    <input 
                      type="number" 
                      value={quoteForm.base}
                      onChange={e => setQuoteForm({...quoteForm, base: e.target.value})}
                      step="0.01"
                    />
                  </div>
                  <div className="form-row">
                    <label>Air Transport Fee</label>
                    <input 
                      type="number" 
                      value={quoteForm.airFee}
                      onChange={e => setQuoteForm({...quoteForm, airFee: e.target.value})}
                      step="0.01"
                    />
                  </div>
                  <div className="form-row">
                    <label>Clearance Fee</label>
                    <input 
                      type="number" 
                      value={quoteForm.clearanceFee}
                      onChange={e => setQuoteForm({...quoteForm, clearanceFee: e.target.value})}
                      step="0.01"
                    />
                  </div>
                  <div className="form-row">
                    <label>Insurance</label>
                    <input 
                      type="number" 
                      value={quoteForm.insurance}
                      onChange={e => setQuoteForm({...quoteForm, insurance: e.target.value})}
                      step="0.01"
                    />
                  </div>
                  <div className="form-row total">
                    <label>Total</label>
                    <input 
                      type="number" 
                      value={quoteForm.total}
                      onChange={e => setQuoteForm({...quoteForm, total: e.target.value})}
                      step="0.01"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedShipment(null)}>
                  Close
                </button>
                <button className="btn-primary" onClick={handleApprove}>
                  Approve & Send Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingShipmentsPage;





// // src/components/Admin/ShipmentsPage.jsx
// import React, { useState, useEffect } from 'react';
// import { db } from '../../lib/firebase';
// import { 
//   collection, 
//   query, 
//   where, 
//   orderBy, 
//   getDocs,
//   doc,
//   updateDoc,
//   serverTimestamp
// } from 'firebase/firestore';
// import './PendingShipmentsPage.css';

// const PendingAdminShipmentsPage = () => {
//   const [shipments, setShipments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedShipment, setSelectedShipment] = useState(null);
//   const [quoteForm, setQuoteForm] = useState({
//     base: '',
//     airFee: '',
//     clearanceFee: '',
//     insurance: '',
//     total: ''
//   });

//   useEffect(() => {
//     const fetchShipments = async () => {
//       const q = query(
//         collection(db, 'shipments'),
//         where('status', '==', 'pending_review'),
//         orderBy('createdAt', 'desc')
//       );
//       const snap = await getDocs(q);
//       setShipments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
//       setLoading(false);
//     };
//     fetchShipments();
//   }, []);

//   const openQuoteModal = (shipment) => {
//     setSelectedShipment(shipment);
//     setQuoteForm({
//       base: '249.99',
//       airFee: '80.00',
//       clearanceFee: '45.00',
//       insurance: '10.00',
//       total: '384.99'
//     });
//   };

//   const handleApprove = async () => {
//     if (!selectedShipment) return;

//     try {
//       const total = parseFloat(quoteForm.total);
//       await updateDoc(doc(db, 'shipments', selectedShipment.id), {
//         status: 'quote_ready',
//         quote: {
//           ...quoteForm,
//           total
//         },
//         updatedAt: serverTimestamp()
//       });

//       // Refresh list
//       setShipments(prev => prev.filter(s => s.id !== selectedShipment.id));
//       setSelectedShipment(null);
//       alert('Quote approved and sent to user.');
//     } catch (err) {
//       console.error('Approval failed:', err);
//       alert('Failed to approve shipment.');
//     }
//   };

//   const handleReject = async (id) => {
//     if (!window.confirm('Are you sure you want to reject this request?')) return;
//     try {
//       await updateDoc(doc(db, 'shipments', id), {
//         status: 'canceled',
//         canceledReason: 'Rejected by admin',
//         updatedAt: serverTimestamp()
//       });
//       setShipments(prev => prev.filter(s => s.id !== id));
//     } catch (err) {
//       alert('Failed to reject shipment.');
//     }
//   };

//   return (
//     <div className="admin-shipments">
//       <div className="page-header">
//         <h1>Shipment Requests</h1>
//         <p>Review and approve new shipment requests</p>
//       </div>

//       {loading ? (
//         <div>Loading...</div>
//       ) : shipments.length === 0 ? (
//         <div className="empty-state">
//           <div className="icon">📭</div>
//           <h3>No pending requests</h3>
//           <p>All shipment requests have been processed.</p>
//         </div>
//       ) : (
//         <div className="shipments-table">
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>From → To</th>
//                 <th>Weight</th>
//                 <th>Service</th>
//                 <th>Submitted</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {shipments.map(ship => (
//                 <tr key={ship.id}>
//                   <td>#{ship.id.substring(0, 6)}</td>
//                   <td>
//                     {ship.from?.city || '—'}, {ship.from?.country} → 
//                     {ship.to?.city || '—'}, {ship.to?.country}
//                   </td>
//                   <td>{ship.package?.weight} kg</td>
//                   <td>{ship.shipment?.type || 'Standard'}</td>
//                   <td>{ship.createdAt?.toDate().toLocaleDateString()}</td>
//                   <td>
//                     <button 
//                       className="btn-approve"
//                       onClick={() => openQuoteModal(ship)}
//                     >
//                       Approve
//                     </button>
//                     <button 
//                       className="btn-reject"
//                       onClick={() => handleReject(ship.id)}
//                     >
//                       Reject
//                     </button>
//                     <button 
//                       className="btn-view"
//                       onClick={() => setSelectedShipment(ship)}
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Quote Modal */}
//       {selectedShipment && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>Approve Shipment #{selectedShipment.id}</h3>
//               <button onClick={() => setSelectedShipment(null)}>×</button>
//             </div>
            
//             <div className="modal-body">
//               <h4>Shipment Details</h4>
//               <div className="detail-row">
//                 <strong>From:</strong> {selectedShipment.from?.name} — {selectedShipment.from?.address}
//               </div>
//               <div className="detail-row">
//                 <strong>To:</strong> {selectedShipment.to?.name} — {selectedShipment.to?.address}
//               </div>
//               <div className="detail-row">
//                 <strong>Package:</strong> {selectedShipment.package?.description}
//               </div>

//               <h4>Quote</h4>
//               <div className="quote-form">
//                 <div className="form-row">
//                   <label>Base Rate</label>
//                   <input 
//                     type="number" 
//                     value={quoteForm.base}
//                     onChange={e => setQuoteForm({...quoteForm, base: e.target.value})}
//                     step="0.01"
//                   />
//                 </div>
//                 <div className="form-row">
//                   <label>Air Transport Fee</label>
//                   <input 
//                     type="number" 
//                     value={quoteForm.airFee}
//                     onChange={e => setQuoteForm({...quoteForm, airFee: e.target.value})}
//                     step="0.01"
//                   />
//                 </div>
//                 <div className="form-row">
//                   <label>Clearance Fee</label>
//                   <input 
//                     type="number" 
//                     value={quoteForm.clearanceFee}
//                     onChange={e => setQuoteForm({...quoteForm, clearanceFee: e.target.value})}
//                     step="0.01"
//                   />
//                 </div>
//                 <div className="form-row">
//                   <label>Insurance</label>
//                   <input 
//                     type="number" 
//                     value={quoteForm.insurance}
//                     onChange={e => setQuoteForm({...quoteForm, insurance: e.target.value})}
//                     step="0.01"
//                   />
//                 </div>
//                 <div className="form-row total">
//                   <label>Total</label>
//                   <input 
//                     type="number" 
//                     value={quoteForm.total}
//                     onChange={e => setQuoteForm({...quoteForm, total: e.target.value})}
//                     step="0.01"
//                     readOnly
//                   />
//                 </div>
//               </div>

//               <div className="modal-actions">
//                 <button className="btn-secondary" onClick={() => setSelectedShipment(null)}>
//                   Cancel
//                 </button>
//                 <button className="btn-primary" onClick={handleApprove}>
//                   Approve & Send Quote
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PendingAdminShipmentsPage;