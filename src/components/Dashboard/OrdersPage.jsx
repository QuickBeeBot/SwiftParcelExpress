// src/components/Dashboard/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './OrdersPage.css';

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ status: '' });

  // Fetch user's orders
  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      const q = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Start editing
  const handleEdit = (order) => {
    setEditingId(order.id);
    setEditForm({ status: order.status });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ status: '' });
  };

  // Save edit
  const handleSaveEdit = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: editForm.status,
        updatedAt: new Date()
      });

      // Optimistic update
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: editForm.status } : o
      ));

      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update order status.');
    }
  };

  // Get status class
  const getStatusClass = (status) => {
    const map = {
      'Pending': 'pending',
      'In Transit': 'in-transit',
      'Delivered': 'delivered',
      'Canceled': 'canceled'
    };
    return map[status] || 'pending';
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <button 
          className="btn-primarys" 
          onClick={() => navigate('/dashboard/new-shipment')}
        >
          <i className="fas fa-plus"></i> New Order
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Tracking</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No orders yet. Create your first shipment to get started.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.customer || order.to?.name || '—'}</td>
                    <td>
                      {editingId === order.id ? (
                        <div className="edit-status">
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ status: e.target.value })}
                            className="status-select"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                          <div className="edit-actions">
                            <button 
                              className="btn-small btn-success"
                              onClick={() => handleSaveEdit(order.id)}
                            >
                              Save
                            </button>
                            <button 
                              className="btn-small btn-secondary"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td>{order.total || '$0.00'}</td>
                    <td>
                      {order.tracking ? (
                        <Link 
                          to={`/dashboard/tracking?tracking=${order.tracking}`} 
                          className="tracking-link"
                        >
                          {order.tracking}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <Link 
                        to={`/dashboard/order/${order.id}`} 
                        className="btn-small"
                      >
                        View
                      </Link>
                      <button 
                        className="btn-small btn-secondary"
                        onClick={() => handleEdit(order)}
                        disabled={editingId && editingId !== order.id}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;





// // src/components/Dashboard/OrdersPage.jsx
// import React, { useState, useEffect } from 'react';
// import './OrdersPage.css';

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([
//     {
//       id: 'ORD2025001',
//       date: '2025-06-01',
//       status: 'Delivered',
//       customer: 'John Doe',
//       total: '$249.99',
//       tracking: 'SP1001XYZ'
//     },
//     {
//       id: 'ORD2025002',
//       date: '2025-06-10',
//       status: 'In Transit',
//       customer: 'Jane Smith',
//       total: '$189.50',
//       tracking: 'SP1002ABC'
//     },
//     {
//       id: 'ORD2025003',
//       date: '2025-06-15',
//       status: 'Pending',
//       customer: 'Mike Johnson',
//       total: '$99.00',
//       tracking: 'SP1003DEF'
//     }
//   ]);

//   return (
//     <div className="orders-page">
//       <div className="page-header">
//         <h1>Orders</h1>
//         <button className="btn-primarys">+ New Order</button>
//       </div>

//       <div className="orders-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Date</th>
//               <th>Customer</th>
//               <th>Status</th>
//               <th>Total</th>
//               <th>Tracking</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map(order => (
//               <tr key={order.id}>
//                 <td>{order.id}</td>
//                 <td>{order.date}</td>
//                 <td>{order.customer}</td>
//                 <td>
//                   <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
//                     {order.status}
//                   </span>
//                 </td>
//                 <td>{order.total}</td>
//                 <td><a href={`/dashboard/tracking?tracking=${order.tracking}`}>{order.tracking}</a></td>
//                 <td>
//                   <button className="btn-small">View</button>
//                   <button className="btn-small btn-secondary">Edit</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default OrdersPage;