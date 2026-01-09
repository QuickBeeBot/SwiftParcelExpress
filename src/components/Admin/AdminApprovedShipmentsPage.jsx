// src/components/Admin/AdminApprovedShipmentsPage.jsx
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
import {
  Search,
  Package,
  Truck,
  Plane,
  Clock,
  CheckCircle,
  AlertTriangle,
  History,
  Tag,
  User,
  Route,
  Info,
  Eye,
  RefreshCw,
  Filter,
  X
} from 'lucide-react';
import './AdminApprovedShipmentsPage.css';

const AdminApprovedShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'timeline', 'quote'

  // Fetch approved shipments
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError('');

        const q = query(
          collection(db, 'shipments'),
          where('status', 'in', ['quote_ready', 'paid', 'in_transit', 'out_for_delivery']),
          orderBy('updatedAt', 'desc')
        );

        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || doc.data().createdAt?.toDate() || new Date()
        }));

        setShipments(data);
      } catch (err) {
        console.error('Failed to load approved shipments:', err);
        setError('Failed to load approved shipments.');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Update shipment status
  const updateStatus = async (id, status, notes = '') => {
    try {
      const updates = {
        status,
        updatedAt: serverTimestamp()
      };
      if (notes) updates.notes = notes;

      if (status === 'in_transit' && !shipments.find(s => s.id === id)?.trackingNumber) {
        const now = new Date();
        const yearSuffix = now.getFullYear().toString().slice(-2);
        const randomPart = Math.floor(100000 + Math.random() * 900000);
        updates.trackingNumber = `SP${yearSuffix}${randomPart}`;
      }

      await updateDoc(doc(db, 'shipments', id), updates);

      setShipments(prev => prev.map(s => 
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      ));

      if (status === 'in_transit') {
        alert(`Shipment is now In Transit. Tracking ID: ${updates.trackingNumber}`);
      } else {
        alert(`Status updated to: ${status}`);
      }

      setSelectedShipment(null);
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update shipment status.');
    }
  };

  // Quick status update
  const quickUpdate = (id, status) => {
    updateStatus(id, status, '');
  };

  // Filter & search
  const filteredShipments = shipments.filter(ship => {
    const matchesSearch = 
      (ship.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.from?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || ship.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status config
  const getStatusConfig = (status) => {
    const config = {
      quote_ready: { text: 'Quote Ready', color: 'warning', icon: AlertTriangle },
      paid: { text: 'Payment Confirmed', color: 'success', icon: CheckCircle },
      in_transit: { text: 'In Transit', color: 'info', icon: Truck },
      out_for_delivery: { text: 'Out for Delivery', color: 'primary', icon: Truck },
      delivered: { text: 'Delivered', color: 'success', icon: CheckCircle }
    };
    return config[status] || { text: status, color: 'secondary', icon: Package };
  };

  // Get route summary
  const getRouteSummary = (route) => {
    if (!route) return '—';
    const pickup = route.pickup?.location || '—';
    const delivery = route.delivery?.location || '—';
    const airLegs = route.airLegs?.length > 0 
      ? `${route.airLegs.length} flight${route.airLegs.length > 1 ? 's' : ''}`
      : 'Ground';
    return `${pickup} → ${airLegs} → ${delivery}`;
  };

  // Total weight
  const getTotalWeight = (packages) => {
    return packages?.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0).toFixed(1) || '0.0';
  };

  return (
    <div className="admin-approved-shipments">
      <div className="page-header">
        <h1>Approved Shipments</h1>
        <p>Manage shipments that have been approved and paid — update status and track progress</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by tracking ID, name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="quote_ready">Quote Ready</option>
              <option value="paid">Paid</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error & Loading */}
      {error && <div className="alert error">❌ {error}</div>}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading approved shipments...</p>
        </div>
      ) : (
        <div className="shipments-table">
          <table>
            <thead>
              <tr>
                <th>Tracking</th>
                <th>Route</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No approved shipments found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(ship => {
                  const config = getStatusConfig(ship.status);
                  const IconComponent = config.icon;
                  return (
                    <tr key={ship.id}>
                      <td>
                        <code>{ship.trackingNumber || '—'}</code>
                      </td>
                      <td data-full-text={getRouteSummary(ship.route)} title={getRouteSummary(ship.route)}>
                        {getRouteSummary(ship.route)}
                      </td>
                      <td>{getTotalWeight(ship.packages)} kg</td>
                      <td>
                        <span className={`status-badge ${config.color}`}>
                          <IconComponent size={14} className="status-icon" />
                          {config.text}
                        </span>
                      </td>
                      <td>{formatDate(ship.updatedAt)}</td>
                      <td>
                        <div className="action-buttons">
                          {/* Quick Status Updates */}
                          {ship.status === 'paid' && (
                            <button 
                              className="quick-action info"
                              onClick={() => quickUpdate(ship.id, 'in_transit')}
                              title="Mark as In Transit"
                            >
                              <Truck size={14} />
                            </button>
                          )}
                          {ship.status === 'in_transit' && (
                            <button 
                              className="quick-action primary"
                              onClick={() => quickUpdate(ship.id, 'out_for_delivery')}
                              title="Mark as Out for Delivery"
                            >
                              <Truck size={14} />
                            </button>
                          )}
                          {['in_transit', 'out_for_delivery'].includes(ship.status) && (
                            <button 
                              className="quick-action success"
                              onClick={() => quickUpdate(ship.id, 'delivered')}
                              title="Mark as Delivered"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}

                          {/* Full Update & View */}
                          <button 
                            className="btn-icon secondary"
                            onClick={() => setSelectedShipment(ship)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && (
        <div className="stats-summary">
          <StatCard 
            value={shipments.filter(s => s.status === 'quote_ready').length}
            label="Quote Ready"
            color="#F59E0B"
          />
          <StatCard 
            value={shipments.filter(s => s.status === 'paid').length}
            label="Paid"
            color="#10B981"
          />
          <StatCard 
            value={shipments.filter(s => s.status === 'in_transit').length}
            label="In Transit"
            color="#36FFDB"
          />
          <StatCard 
            value={shipments.filter(s => s.status === 'out_for_delivery').length}
            label="Out for Delivery"
            color="#3B82F6"
          />
        </div>
      )}

      {/* Modal */}
      {selectedShipment && (
        <div className="modal-overlay" onClick={() => setSelectedShipment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Shipment Details</h3>
                <p>#{selectedShipment.trackingNumber || selectedShipment.id}</p>
              </div>
              <button onClick={() => setSelectedShipment(null)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="modal-tabs">
              <button 
                className={activeTab === 'details' ? 'active' : ''}
                onClick={() => setActiveTab('details')}
              >
                <Info size={16} /> Details
              </button>
              <button 
                className={activeTab === 'timeline' ? 'active' : ''}
                onClick={() => setActiveTab('timeline')}
              >
                <History size={16} /> Timeline
              </button>
              {selectedShipment.quote && (
                <button 
                  className={activeTab === 'quote' ? 'active' : ''}
                  onClick={() => setActiveTab('quote')}
                >
                  <Tag size={16} /> Quote
                </button>
              )}
            </div>

            <div className="modal-body">
              {activeTab === 'details' && <ShipmentDetails shipment={selectedShipment} />}
              {activeTab === 'timeline' && <Timeline events={selectedShipment.events || []} />}
              {activeTab === 'quote' && <QuoteDetails quote={selectedShipment.quote} />}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedShipment(null)}>
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setSelectedShipment(null);
                  // Navigate to full update page if needed
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ value, label, color }) => (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

// Shipment Details Tab
const ShipmentDetails = ({ shipment }) => (
  <div className="tab-content">
    <Section title="Client Information" icon={<User size={18} />}>
      <DetailRow label="Name" value={shipment.client?.name || '—'} />
      <DetailRow label="Email" value={shipment.client?.email || '—'} />
      <DetailRow label="Phone" value={shipment.client?.phone || '—'} />
      <DetailRow label="Company" value={shipment.client?.company || '—'} />
    </Section>

    <Section title="Package Details" icon={<Package size={18} />}>
      {shipment.packages?.map((pkg, i) => (
        <div key={i} className="package-item">
          <DetailRow label={`Package ${i + 1}`} value={pkg.description} />
          <DetailRow label="Weight" value={`${pkg.weight} kg`} />
          <DetailRow label="Dimensions" value={`${pkg.length} × ${pkg.width} × ${pkg.height} cm`} />
          <DetailRow label="Category" value={pkg.category} />
          {pkg.requiresClearance && (
            <DetailRow label="Customs Declaration" value={pkg.contents || '—'} />
          )}
        </div>
      ))}
    </Section>

    <Section title="Route Details" icon={<Route size={18} />}>
      <RouteLeg 
        type="pickup"
        location={shipment.route?.pickup?.location || '—'}
        facility={shipment.route?.pickup?.facility || '—'}
        scheduled={shipment.route?.pickup?.scheduledTime}
        actual={shipment.route?.pickup?.actualTime}
      />
      {shipment.route?.airLegs?.map((leg, i) => (
        <RouteLeg 
          key={i}
          type="air"
          flight={leg.flightNumber || '—'}
          aircraft={leg.aircraft || '—'}
          departureAirport={leg.departureAirport || '—'}
          arrivalAirport={leg.arrivalAirport || '—'}
          departureScheduled={leg.departureTimeScheduled}
          arrivalScheduled={leg.arrivalTimeScheduled}
          departureActual={leg.departureTimeActual}
          arrivalActual={leg.arrivalTimeActual}
        />
      ))}
      <RouteLeg 
        type="delivery"
        location={shipment.route?.delivery?.location || '—'}
        facility={shipment.route?.delivery?.facility || '—'}
        scheduled={shipment.route?.delivery?.scheduledTime}
        actual={shipment.route?.delivery?.actualTime}
      />
    </Section>

    <Section title="Shipment Details" icon={<Info size={18} />}>
      <DetailRow label="Priority" value={shipment.shipment?.priority || 'Medium'} />
      <DetailRow label="Insurance" value={shipment.shipment?.insurance ? 'Yes' : 'No'} />
      <DetailRow label="Signature Required" value={shipment.shipment?.signatureRequired ? 'Yes' : 'No'} />
      <DetailRow label="Instructions" value={shipment.shipment?.instructions || '—'} />
    </Section>
  </div>
);

// Timeline Tab
const Timeline = ({ events }) => (
  <div className="tab-content">
    {events.length === 0 ? (
      <p className="no-events">No timeline events recorded.</p>
    ) : (
      <div className="timeline-list">
        {events.map((event, i) => (
          <div key={i} className="timeline-event">
            <div className="event-time">{new Date(event.timestamp).toLocaleString()}</div>
            <div className="event-description">{event.description}</div>
            <div className="event-location">{event.location}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Quote Tab
const QuoteDetails = ({ quote }) => (
  <div className="tab-content">
    <div className="quote-grid">
      <QuoteItem label="Base Rate" value={quote.base} />
      <QuoteItem label="Air Transport Fee" value={quote.airFee} />
      <QuoteItem label="Clearance Fee" value={quote.clearanceFee} />
      <QuoteItem label="Insurance" value={quote.insurance} />
      <div className="quote-total">
        <strong>Total:</strong> ${typeof quote.total === 'number' ? quote.total.toFixed(2) : quote.total}
      </div>
    </div>
  </div>
);

// Reusable Components
const Section = ({ title, icon, children }) => (
  <div className="section">
    <h4>{icon} {title}</h4>
    {children}
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <span className="detail-label">{label}:</span>
    <span className="detail-value">{value}</span>
  </div>
);

const RouteLeg = ({ type, ...props }) => {
  let content;
  if (type === 'pickup' || type === 'delivery') {
    content = (
      <>
        <DetailRow label={type === 'pickup' ? 'Pickup Location' : 'Delivery Location'} value={props.location} />
        <DetailRow label="Facility" value={props.facility} />
        {props.scheduled && <DetailRow label="Scheduled Time" value={new Date(props.scheduled).toLocaleTimeString()} />}
        {props.actual && <DetailRow label="Actual Time" value={new Date(props.actual).toLocaleTimeString()} />}
      </>
    );
  } else if (type === 'air') {
    content = (
      <>
        <DetailRow label="Flight Number" value={props.flight} />
        <DetailRow label="Aircraft" value={props.aircraft} />
        <DetailRow label="Departure" value={`${props.departureAirport} @ ${props.departureScheduled ? new Date(props.departureScheduled).toLocaleTimeString() : '—'}`} />
        <DetailRow label="Arrival" value={`${props.arrivalAirport} @ ${props.arrivalScheduled ? new Date(props.arrivalScheduled).toLocaleTimeString() : '—'}`} />
        {props.departureActual && <DetailRow label="Actual Departure" value={new Date(props.departureActual).toLocaleTimeString()} />}
        {props.arrivalActual && <DetailRow label="Actual Arrival" value={new Date(props.arrivalActual).toLocaleTimeString()} />}
      </>
    );
  }

  return <div className="route-leg">{content}</div>;
};

const QuoteItem = ({ label, value }) => (
  <div className="quote-item">
    <span>{label}:</span>
    <span>${typeof value === 'number' ? value.toFixed(2) : value}</span>
  </div>
);

export default AdminApprovedShipmentsPage;




// // src/components/Admin/AdminApprovedShipmentsPage.jsx
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
// import './AdminApprovedShipmentsPage.css';

// const AdminApprovedShipmentsPage = () => {
//   const [shipments, setShipments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [selectedShipment, setSelectedShipment] = useState(null);
//   const [statusForm, setStatusForm] = useState({ status: '', notes: '' });
//   const [viewMode, setViewMode] = useState('details'); // 'details' or 'update'

//   // Fetch approved shipments
//   useEffect(() => {
//     const fetchShipments = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         const q = query(
//           collection(db, 'shipments'),
//           where('status', 'in', ['quote_ready', 'paid', 'in_transit', 'out_for_delivery']),
//           orderBy('updatedAt', 'desc')
//         );

//         const snap = await getDocs(q);
//         const data = snap.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           createdAt: doc.data().createdAt?.toDate() || new Date(),
//           updatedAt: doc.data().updatedAt?.toDate() || doc.data().createdAt?.toDate() || new Date()
//         }));

//         setShipments(data);
//       } catch (err) {
//         console.error('Failed to load approved shipments:', err);
//         setError('Failed to load approved shipments.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShipments();
//   }, []);

//   // Update shipment status
//   const updateStatus = async (id, status, notes = '') => {
//     try {
//       const updates = {
//         status,
//         updatedAt: serverTimestamp()
//       };
//       if (notes) updates.notes = notes;

//       if (status === 'in_transit' && !shipments.find(s => s.id === id)?.trackingNumber) {
//         const now = new Date();
//         const yearSuffix = now.getFullYear().toString().slice(-2);
//         const randomPart = Math.floor(100000 + Math.random() * 900000);
//         updates.trackingNumber = `SP${yearSuffix}${randomPart}`;
//       }

//       await updateDoc(doc(db, 'shipments', id), updates);

//       setShipments(prev => prev.map(s => 
//         s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
//       ));

//       if (status === 'in_transit') {
//         alert(`  Shipment is now In Transit. Tracking ID: ${updates.trackingNumber}`);
//       } else {
//         alert(`Status updated to: ${status}`);
//       }

//       setSelectedShipment(null);
//     } catch (err) {
//       console.error('Status update failed:', err);
//       alert('Failed to update shipment status.');
//     }
//   };

//   // Open view/update modal
//   const openModal = (shipment, mode = 'details') => {
//     setSelectedShipment(shipment);
//     setViewMode(mode);
//     setStatusForm({
//       status: shipment.status,
//       notes: shipment.notes || ''
//     });
//   };

//   // Filter & search
//   const filteredShipments = shipments.filter(ship => {
//     const matchesSearch = 
//       ship.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ship.from?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ship.to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ship.id.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus = filterStatus === 'all' || ship.status === filterStatus;

//     return matchesSearch && matchesStatus;
//   });

//   // Format date
//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString(undefined, {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   // Format time
//   const formatTime = (date) => {
//     return new Date(date).toLocaleTimeString(undefined, {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Get route summary
//   const getRouteSummary = (route) => {
//     if (!route) return '—';
//     const pickup = `${route.pickup?.location || '—'} (${route.pickup?.facility || '—'})`;
//     const delivery = `${route.delivery?.location || '—'} (${route.delivery?.facility || '—'})`;
//     const airLegs = route.airLegs?.map(leg => `${leg.departureAirport} → ${leg.arrivalAirport}`).join(' → ') || '—';
//     return `${pickup} → ${airLegs} → ${delivery}`;
//   };

//   // Package summary
//   const getPackageSummary = (packages) => {
//     if (!packages || packages.length === 0) return '—';
//     return packages.map((p, i) => `${i + 1}. ${p.description} (${p.weight} kg)`).join(', ');
//   };

//   // Status badge
//   const getStatusBadge = (status) => {
//     const config = {
//       quote_ready: { text: 'Quote Ready', color: 'warning' },
//       paid: { text: 'Payment Confirmed', color: 'success' },
//       in_transit: { text: 'In Transit', color: 'info' },
//       out_for_delivery: { text: 'Out for Delivery', color: 'primary' },
//       delivered: { text: 'Delivered', color: 'success' }
//     };
//     return config[status] || { text: status, color: 'secondary' };
//   };

//   // Calculate transit time
//   const calculateTransitTime = (ship) => {
//     if (!ship.createdAt || !ship.updatedAt) return '—';
//     const diff = (new Date(ship.updatedAt) - new Date(ship.createdAt)) / (1000 * 60 * 60 * 24);
//     return Math.ceil(diff) + ' days';
//   };

//   // On-time rate
//   const isOnTime = (ship) => {
//     if (!ship.estimatedDelivery || !ship.deliveredAt) return '—';
//     const promised = new Date(ship.estimatedDelivery);
//     const delivered = new Date(ship.deliveredAt);
//     return delivered <= promised ? 'Yes' : 'No';
//   };

//   return (
//     <div className="admin-approved-shipments">
//       <div className="page-header">
//         <h1>Approved Shipments</h1>
//         <p>Manage shipments that have been approved and paid — update status and track progress</p>
//       </div>

//       {/* Controls */}
//       <div className="controls">
//         <div className="search-bar">
//           <i className="fas fa-search"></i>
//           <input
//             type="text"
//             placeholder="Search by tracking ID, name, or ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div className="filters">
//           <div className="filter-group">
//             <label>Status:</label>
//             <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//               <option value="all">All Statuses</option>
//               <option value="quote_ready">Quote Ready</option>
//               <option value="paid">Paid</option>
//               <option value="in_transit">In Transit</option>
//               <option value="out_for_delivery">Out for Delivery</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Error & Loading */}
//       {error && <div className="alert error">❌ {error}</div>}
//       {loading ? (
//         <div className="loading-state">
//           <div className="spinner"></div>
//           <p>Loading approved shipments...</p>
//         </div>
//       ) : (
//         <div className="shipments-table">
//           <table>
//             <thead>
//               <tr>
//                 <th>Tracking</th>
//                 <th>Route</th>
//                 <th>Weight</th>
//                 <th>Status</th>
//                 <th>Updated</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredShipments.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="no-data">
//                     No approved shipments found. Try adjusting your filters.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredShipments.map(ship => {
//                   const badge = getStatusBadge(ship.status);
//                   return (
//                     <tr key={ship.id}>
//                       <td>
//                         <code>{ship.trackingNumber || '—'}</code>
//                       </td>
//                       <td>
//                         {getRouteSummary(ship.route)}
//                       </td>
//                       <td>
//                         {ship.packages?.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0).toFixed(1)} kg
//                       </td>
//                       <td>
//                         <span className={`status-badge ${badge.color}`}>
//                           {badge.text}
//                         </span>
//                       </td>
//                       <td>{formatDate(ship.updatedAt)}</td>
//                       <td>
//                         <button 
//                           className="btn-update"
//                           onClick={() => openModal(ship, 'update')}
//                         >
//                           <i className="fas fa-sync-alt"></i> Update Status
//                         </button>
//                         <button 
//                           className="btn-view"
//                           onClick={() => openModal(ship, 'details')}
//                         >
//                           <i className="fas fa-eye"></i> View
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Modal */}
//       {selectedShipment && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>{viewMode === 'details' ? 'Shipment Details' : 'Update Shipment Status'}</h3>
//               <button onClick={() => setSelectedShipment(null)}>×</button>
//             </div>
            
//             <div className="modal-body">
//               {viewMode === 'details' ? (
//                 <>
//                   {/* Client Info */}
//                   <div className="section">
//                     <h4><i className="fas fa-user"></i> Client Information</h4>
//                     <div className="client-info">
//                       <div><strong>Name:</strong> {selectedShipment.client?.name || '—'}</div>
//                       <div><strong>Email:</strong> {selectedShipment.client?.email || '—'}</div>
//                       <div><strong>Phone:</strong> {selectedShipment.client?.phone || '—'}</div>
//                       <div><strong>Company:</strong> {selectedShipment.client?.company || '—'}</div>
//                     </div>
//                   </div>

//                   {/* Package Details */}
//                   <div className="section">
//                     <h4><i className="fas fa-boxes"></i> Package Details</h4>
//                     {selectedShipment.packages?.map((pkg, i) => (
//                       <div key={pkg.id} className="package-item">
//                         <div><strong>Package {i + 1}:</strong> {pkg.description}</div>
//                         <div><strong>Weight:</strong> {pkg.weight} kg</div>
//                         <div><strong>Dimensions:</strong> {pkg.length} × {pkg.width} × {pkg.height} cm</div>
//                         <div><strong>Category:</strong> {pkg.category}</div>
//                         {pkg.requiresClearance && (
//                           <div><strong>Customs:</strong> {pkg.contents || '—'}</div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Route Details */}
//                   <div className="section">
//                     <h4><i className="fas fa-route"></i> Route Details</h4>
                    
//                     {/* Pickup */}
//                     <div className="route-leg">
//                       <div className="leg-icon road"><i className="fas fa-truck"></i></div>
//                       <div className="leg-content">
//                         <div><strong>Pickup:</strong> {selectedShipment.route?.pickup?.location || '—'} ({selectedShipment.route?.pickup?.facility || '—'})</div>
//                         <div><strong>Scheduled:</strong> {selectedShipment.route?.pickup?.scheduledTime ? formatTime(selectedShipment.route.pickup.scheduledTime) : '—'}</div>
//                         <div><strong>Actual:</strong> {selectedShipment.route?.pickup?.actualTime ? formatTime(selectedShipment.route.pickup.actualTime) : '—'}</div>
//                       </div>
//                     </div>

//                     {/* Air Legs */}
//                     {selectedShipment.route?.airLegs?.map((leg, i) => (
//                       <div key={leg.id} className="route-leg">
//                         <div className="leg-icon air"><i className="fas fa-plane"></i></div>
//                         <div className="leg-content">
//                           <div><strong>Flight {i + 1}:</strong> {leg.flightNumber || '—'} ({leg.aircraft || '—'})</div>
//                           <div><strong>Departure:</strong> {leg.departureAirport || '—'} @ {leg.departureTimeScheduled ? formatTime(leg.departureTimeScheduled) : '—'}</div>
//                           <div><strong>Arrival:</strong> {leg.arrivalAirport || '—'} @ {leg.arrivalTimeScheduled ? formatTime(leg.arrivalTimeScheduled) : '—'}</div>
//                           {leg.departureTimeActual && (
//                             <div><strong>Actual Departure:</strong> {formatTime(leg.departureTimeActual)}</div>
//                           )}
//                           {leg.arrivalTimeActual && (
//                             <div><strong>Actual Arrival:</strong> {formatTime(leg.arrivalTimeActual)}</div>
//                           )}
//                         </div>
//                       </div>
//                     ))}

//                     {/* Delivery */}
//                     <div className="route-leg">
//                       <div className="leg-icon road"><i className="fas fa-truck"></i></div>
//                       <div className="leg-content">
//                         <div><strong>Delivery:</strong> {selectedShipment.route?.delivery?.location || '—'} ({selectedShipment.route?.delivery?.facility || '—'})</div>
//                         <div><strong>Scheduled:</strong> {selectedShipment.route?.delivery?.scheduledTime ? formatTime(selectedShipment.route.delivery.scheduledTime) : '—'}</div>
//                         <div><strong>Actual:</strong> {selectedShipment.route?.delivery?.actualTime ? formatTime(selectedShipment.route.delivery.actualTime) : '—'}</div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Shipment Details */}
//                   <div className="section">
//                     <h4><i className="fas fa-info-circle"></i> Shipment Details</h4>
//                     <div className="shipment-details">
//                       <div><strong>Priority:</strong> {selectedShipment.shipment?.priority || 'Medium'}</div>
//                       <div><strong>Insurance:</strong> {selectedShipment.shipment?.insurance ? 'Yes' : 'Yes'}</div>
//                       <div><strong>Signature Required:</strong> {selectedShipment.shipment?.signatureRequired ? 'Yes' : 'No'}</div>
//                       <div><strong>Instructions:</strong> {selectedShipment.shipment?.instructions || '—'}</div>
//                     </div>
//                   </div>

//                   {/* Quote */}
//                   {/* {selectedShipment.quote && (
//                     <div className="section">
//                       <h4><i className="fas fa-tag"></i> Quote</h4>
//                       <div className="quote-summary">
//                         <div><strong>Base Rate:</strong> ${selectedShipment.quote.base.toFixed(2)}</div>
//                         <div><strong>Air Transport Fee:</strong> ${selectedShipment.quote.airFee.toFixed(2)}</div>
//                         <div><strong>Clearance Fee:</strong> ${selectedShipment.quote.clearanceFee.toFixed(2)}</div>
//                         <div><strong>Insurance:</strong> ${selectedShipment.quote.insurance.toFixed(2)}</div>
//                         <div><strong>Total:</strong> ${selectedShipment.quote.total.toFixed(2)}</div>
//                       </div>
//                     </div>
//                   )} */}
//                   {/* Quote */}
//                   {selectedShipment.quote && (
//                     <div className="section">
//                       <h4><i className="fas fa-tag"></i> Quote</h4>
//                       <div className="quote-summary">
//                         <div>
//                           <strong>Base Rate:</strong>{' '}
//                           ${typeof selectedShipment.quote.base === 'number' 
//                             ? selectedShipment.quote.base.toFixed(2) 
//                             : selectedShipment.quote.base}
//                         </div>
//                         <div>
//                           <strong>Air Transport Fee:</strong>{' '}
//                           ${typeof selectedShipment.quote.airFee === 'number' 
//                             ? selectedShipment.quote.airFee.toFixed(2) 
//                             : selectedShipment.quote.airFee}
//                         </div>
//                         <div>
//                           <strong>Clearance Fee:</strong>{' '}
//                           ${typeof selectedShipment.quote.clearanceFee === 'number' 
//                             ? selectedShipment.quote.clearanceFee.toFixed(2) 
//                             : selectedShipment.quote.clearanceFee}
//                         </div>
//                         <div>
//                           <strong>Insurance:</strong>{' '}
//                           ${typeof selectedShipment.quote.insurance === 'number' 
//                             ? selectedShipment.quote.insurance.toFixed(2) 
//                             : selectedShipment.quote.insurance}
//                         </div>
//                         <div>
//                           <strong>Total:</strong>{' '}
//                           ${typeof selectedShipment.quote.total === 'number' 
//                             ? selectedShipment.quote.total.toFixed(2) 
//                             : selectedShipment.quote.total}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Events */}
//                   <div className="section">
//                     <h4><i className="fas fa-history"></i> Timeline</h4>
//                     <div className="events-list">
//                       {selectedShipment.events?.map((event, i) => (
//                         <div key={i} className="event-item">
//                           <div className="event-time">{new Date(event.timestamp).toLocaleString()}</div>
//                           <div className="event-description">{event.description}</div>
//                           <div className="event-location">{event.location}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="modal-actions">
//                     <button className="btn-secondary" onClick={() => setSelectedShipment(null)}>
//                       Close
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   {/* Update Status Form */}
//                   <div className="section">
//                     <h4><i className="fas fa-sync-alt"></i> Update Shipment Status</h4>
//                     <div className="form-group">
//                       <label>Current Status:</label>
//                       <span className={`status-badge ${getStatusBadge(selectedShipment.status).color}`}>
//                         {getStatusBadge(selectedShipment.status).text}
//                       </span>
//                     </div>
//                     <div className="form-group">
//                       <label>New Status</label>
//                       <select
//                         value={statusForm.status}
//                         onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
//                       >
//                         <option value="quote_ready">Quote Ready</option>
//                         <option value="paid">Payment Confirmed</option>
//                         <option value="in_transit">In Transit</option>
//                         <option value="out_for_delivery">Out for Delivery</option>
//                         <option value="delivered">Delivered</option>
//                       </select>
//                     </div>
//                     <div className="form-group">
//                       <label>Notes (optional)</label>
//                       <textarea
//                         value={statusForm.notes}
//                         onChange={(e) => setStatusForm({...statusForm, notes: e.target.value})}
//                         placeholder="e.g., Package handed to driver #45"
//                         rows="3"
//                       />
//                     </div>
//                   </div>

//                   <div className="modal-actions">
//                     <button className="btn-secondary" onClick={() => setSelectedShipment(null)}>
//                       Cancel
//                     </button>
//                     <button 
//                       className="btn-primary" 
//                       onClick={() => updateStatus(selectedShipment.id, statusForm.status, statusForm.notes)}
//                     >
//                       Update Status
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Stats Summary */}
//       {!loading && (
//         <div className="stats-summary">
//           <div className="stat-card warning">
//             <div className="stat-value">
//               {shipments.filter(s => s.status === 'quote_ready').length}
//             </div>
//             <div className="stat-label">Quote Ready</div>
//           </div>
//           <div className="stat-card success">
//             <div className="stat-value">
//               {shipments.filter(s => s.status === 'paid').length}
//             </div>
//             <div className="stat-label">Paid</div>
//           </div>
//           <div className="stat-card info">
//             <div className="stat-value">
//               {shipments.filter(s => s.status === 'in_transit').length}
//             </div>
//             <div className="stat-label">In Transit</div>
//           </div>
//           <div className="stat-card primary">
//             <div className="stat-value">
//               {shipments.filter(s => s.status === 'out_for_delivery').length}
//             </div>
//             <div className="stat-label">Out for Delivery</div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminApprovedShipmentsPage;






