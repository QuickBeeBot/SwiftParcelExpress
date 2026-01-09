// src/components/Admin/ShipmentsPage.jsx
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
import './ShipmentsPage.css';

const AdminShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    base: '',
    airFee: '',
    clearanceFee: '',
    insurance: '',
    total: ''
  });

  useEffect(() => {
    const fetchShipments = async () => {
      const q = query(
        collection(db, 'shipments'),
        where('status', '==', 'pending_review'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setShipments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchShipments();
  }, []);

  const openQuoteModal = (shipment) => {
    setSelectedShipment(shipment);
    setQuoteForm({
      base: '249.99',
      airFee: '80.00',
      clearanceFee: '45.00',
      insurance: '10.00',
      total: '384.99'
    });
  };

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
      alert('Quote approved and sent to user.');
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve shipment.');
    }
  };

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

  return (
    <div className="admin-shipments">
      <div className="page-header">
        <h1>Shipment Requests</h1>
        <p>Review and approve new shipment requests</p>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : shipments.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No pending requests</h3>
          <p>All shipment requests have been processed.</p>
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
              {shipments.map(ship => (
                <tr key={ship.id}>
                  <td>#{ship.id.substring(0, 6)}</td>
                  <td>
                    {ship.from?.city || '—'}, {ship.from?.country} → 
                    {ship.to?.city || '—'}, {ship.to?.country}
                  </td>
                  <td>{ship.package?.weight} kg</td>
                  <td>{ship.shipment?.type || 'Standard'}</td>
                  <td>{ship.createdAt?.toDate().toLocaleDateString()}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quote Modal */}
      {selectedShipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Approve Shipment #{selectedShipment.id}</h3>
              <button onClick={() => setSelectedShipment(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <h4>Shipment Details</h4>
              <div className="detail-row">
                <strong>From:</strong> {selectedShipment.from?.name} — {selectedShipment.from?.address}
              </div>
              <div className="detail-row">
                <strong>To:</strong> {selectedShipment.to?.name} — {selectedShipment.to?.address}
              </div>
              <div className="detail-row">
                <strong>Package:</strong> {selectedShipment.package?.description}
              </div>

              <h4>Quote</h4>
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

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedShipment(null)}>
                  Cancel
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

export default AdminShipmentsPage;




