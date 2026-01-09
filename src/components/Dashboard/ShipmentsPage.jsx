// src/components/Dashboard/ShipmentsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './ShipmentsPage.css';

const ShipmentsPage = () => {
  const { currentUser } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  // Fetch shipments from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError('');

        // Query user's shipments
        const q = query(
          collection(db, 'shipments'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        setShipments(data);
      } catch (err) {
        console.error('Error fetching shipments:', err);
        setError('Failed to load shipments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [currentUser]);

  // Stats
  const stats = useMemo(() => {
    const total = shipments.length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    const inTransit = shipments.filter(s => s.status === 'in_transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const canceled = shipments.filter(s => s.status === 'canceled').length;
    return { total, pending, inTransit, delivered, canceled };
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(ship => {
      const matchesStatus = filters.status === 'all' || ship.status === filters.status;
      const matchesSearch = 
        ship.tracking?.toLowerCase().includes(filters.search.toLowerCase()) ||
        ship.to?.city?.toLowerCase().includes(filters.search.toLowerCase()) ||
        ship.id?.toLowerCase().includes(filters.search.toLowerCase()) ||
        ship.to?.country?.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [shipments, filters]);

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { text: 'Pending', color: 'warning' },
      in_transit: { text: 'In Transit', color: 'info' },
      delivered: { text: 'Delivered', color: 'success' },
      canceled: { text: 'Canceled', color: 'danger' }
    };
    return config[status] || config.pending;
  };

  //   Export to CSV
  const exportToCSV = () => {
    if (filteredShipments.length === 0) return;

    const headers = [
      'ID', 'Tracking', 'From', 'To', 'Service', 'Weight (kg)',
      'Date', 'Est. Delivery', 'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredShipments.map(ship => [
        ship.id,
        ship.tracking,
        `${ship.from?.city}, ${ship.from?.country}`,
        `${ship.to?.city}, ${ship.to?.country}`,
        ship.service,
        ship.package?.weight || 'N/A',
        ship.createdAt?.toLocaleDateString() || ship.date,
        ship.estimatedDelivery || '—',
        ship.status
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `swiftshipments_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //   Print labels
  const printLabels = () => {
    if (filteredShipments.length === 0) return;
    
    const printContent = `
      <html>
        <head>
          <title>SwiftParcel Labels</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 20px; }
            .label { border: 2px solid #333; padding: 15px; margin-bottom: 20px; }
            .tracking { font-size: 24px; font-weight: bold; }
            .address { font-size: 14px; line-height: 1.4; }
            .service { font-size: 16px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          ${filteredShipments.map(ship => `
            <div class="label">
              <div class="tracking">Tracking: ${ship.tracking}</div>
              <div class="service">${ship.service.toUpperCase()}</div>
              <div class="address">
                <strong>To:</strong><br>
                ${ship.to?.name}<br>
                ${ship.to?.address}<br>
                ${ship.to?.city}, ${ship.to?.zip}<br>
                ${ship.to?.country}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="shipments-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Shipments</h1>
          <p>Manage and track all your deliveries in one place</p>
        </div>
        <Link to="/dashboard/new-shipment" className="btn-primarys">
          <i className="fas fa-plus"></i> New Shipment
        </Link>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading shipments...</p>
        </div>
      )}

      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Stats */}
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Shipments</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card info">
              <div className="stat-value">{stats.inTransit}</div>
              <div className="stat-label">In Transit</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{stats.delivered}</div>
              <div className="stat-label">Delivered</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">{stats.canceled}</div>
              <div className="stat-label">Canceled</div>
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by tracking ID, destination..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select value={filters.status} onChange={handleStatusChange}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div className="actions">
              <button className="btn-secondary" onClick={exportToCSV}>
                <i className="fas fa-download"></i> Export CSV
              </button>
              <button className="btn-secondary" onClick={printLabels}>
                <i className="fas fa-print"></i> Print Labels
              </button>
            </div>
          </div>

          {/* Shipments Table */}
          <div className="shipments-table">
            <table>
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Tracking</th>
                  <th>Route</th>
                  <th>Service</th>
                  <th>Weight</th>
                  <th>Date</th>
                  <th>Est. Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No shipments found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map(ship => {
                    const badge = getStatusBadge(ship.status);
                    return (
                      <tr key={ship.id}>
                        <td>#{ship.id}</td>
                        <td>
                          <code>{ship.tracking}</code>
                        </td>
                        <td>
                          <div className="route">
                            <span className="from">
                              {ship.from?.city || '—'}{ship.from?.country ? `, ${ship.from.country}` : ''}
                            </span>
                            <span className="arrow">→</span>
                            <span className="to">
                              {ship.to?.city || '—'}{ship.to?.country ? `, ${ship.to.country}` : ''}
                            </span>
                          </div>
                        </td>
                        <td>{ship.service}</td>
                        <td>{ship.package?.weight ? `${ship.package.weight} kg` : '—'}</td>
                        <td>{ship.createdAt?.toLocaleDateString() || '—'}</td>
                        <td>
                          {ship.estimatedDelivery 
                            ? new Date(ship.estimatedDelivery).toLocaleDateString() 
                            : '—'}
                        </td>
                        <td>
                          <span className={`status-badge ${badge.color}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td>
                          <Link to={`/dashboard/tracking?tracking=${ship.tracking}`} className="btn-small">
                            Track
                          </Link>
                          <button className="btn-small btn-secondary">Details</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipmentsPage;
















// // src/components/Dashboard/ShipmentsPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { Link } from 'react-router-dom';
// import './ShipmentsPage.css';

// const ShipmentsPage = () => {
//   // Mock data — replace with Firestore query later
//   const [shipments, setShipments] = useState([
//     {
//       id: 'SP2025001',
//       tracking: 'SP2025001XYZ',
//       status: 'delivered',
//       from: 'London, UK',
//       to: 'Paris, France',
//       service: 'Express',
//       weight: '2.4 kg',
//       date: '2025-06-01',
//       estimatedDelivery: '2025-06-03',
//       deliveredOn: '2025-06-03'
//     },
//     {
//       id: 'SP2025002',
//       tracking: 'SP2025002ABC',
//       status: 'in_transit',
//       from: 'New York, USA',
//       to: 'Tokyo, Japan',
//       service: 'Global',
//       weight: '1.8 kg',
//       date: '2025-06-10',
//       estimatedDelivery: '2025-06-18',
//       deliveredOn: null
//     },
//     {
//       id: 'SP2025003',
//       tracking: 'SP2025003DEF',
//       status: 'pending',
//       from: 'Sydney, Australia',
//       to: 'Berlin, Germany',
//       service: 'Economy',
//       weight: '3.1 kg',
//       date: '2025-06-15',
//       estimatedDelivery: '2025-06-25',
//       deliveredOn: null
//     },
//     {
//       id: 'SP2025004',
//       tracking: 'SP2025004GHI',
//       status: 'canceled',
//       from: 'Dubai, UAE',
//       to: 'Johannesburg, South Africa',
//       service: 'Express',
//       weight: '0.9 kg',
//       date: '2025-06-20',
//       estimatedDelivery: '2025-06-22',
//       deliveredOn: null
//     }
//   ]);

//   const [filters, setFilters] = useState({
//     status: 'all',
//     search: ''
//   });

//   // Stats
//   const stats = useMemo(() => {
//     const total = shipments.length;
//     const pending = shipments.filter(s => s.status === 'pending').length;
//     const inTransit = shipments.filter(s => s.status === 'in_transit').length;
//     const delivered = shipments.filter(s => s.status === 'delivered').length;
//     const canceled = shipments.filter(s => s.status === 'canceled').length;
//     return { total, pending, inTransit, delivered, canceled };
//   }, [shipments]);

//   // Filtered shipments
//   const filteredShipments = useMemo(() => {
//     return shipments.filter(ship => {
//       const matchesStatus = filters.status === 'all' || ship.status === filters.status;
//       const matchesSearch = 
//         ship.tracking.toLowerCase().includes(filters.search.toLowerCase()) ||
//         ship.to.toLowerCase().includes(filters.search.toLowerCase()) ||
//         ship.id.toLowerCase().includes(filters.search.toLowerCase());
//       return matchesStatus && matchesSearch;
//     });
//   }, [shipments, filters]);

//   const handleStatusChange = (e) => {
//     setFilters(prev => ({ ...prev, status: e.target.value }));
//   };

//   const handleSearchChange = (e) => {
//     setFilters(prev => ({ ...prev, search: e.target.value }));
//   };

//   const getStatusBadge = (status) => {
//     const config = {
//       pending: { text: 'Pending', color: 'warning' },
//       in_transit: { text: 'In Transit', color: 'info' },
//       delivered: { text: 'Delivered', color: 'success' },
//       canceled: { text: 'Canceled', color: 'danger' }
//     };
//     return config[status] || config.pending;
//   };

//   return (
//     <div className="shipments-page">
//       {/* Header */}
//       <div className="page-header">
//         <div>
//           <h1>Shipments</h1>
//           <p>Manage and track all your deliveries in one place</p>
//         </div>
//         <Link to="/dashboard/new-shipment" className="btn-primarys">
//           <i className="fas fa-plus"></i> New Shipment
//         </Link>
//       </div>

//       {/* Summary Stats */}
//       <div className="summary-stats">
//         <div className="stat-card">
//           <div className="stat-value">{stats.total}</div>
//           <div className="stat-label">Total Shipments</div>
//         </div>
//         <div className="stat-card warning">
//           <div className="stat-value">{stats.pending}</div>
//           <div className="stat-label">Pending</div>
//         </div>
//         <div className="stat-card info">
//           <div className="stat-value">{stats.inTransit}</div>
//           <div className="stat-label">In Transit</div>
//         </div>
//         <div className="stat-card success">
//           <div className="stat-value">{stats.delivered}</div>
//           <div className="stat-label">Delivered</div>
//         </div>
//         <div className="stat-card danger">
//           <div className="stat-value">{stats.canceled}</div>
//           <div className="stat-label">Canceled</div>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="controls">
//         <div className="search-bar">
//           <i className="fas fa-search"></i>
//           <input
//             type="text"
//             placeholder="Search by tracking ID, destination..."
//             value={filters.search}
//             onChange={handleSearchChange}
//           />
//         </div>
//         <div className="filter-group">
//           <label>Status:</label>
//           <select value={filters.status} onChange={handleStatusChange}>
//             <option value="all">All Statuses</option>
//             <option value="pending">Pending</option>
//             <option value="in_transit">In Transit</option>
//             <option value="delivered">Delivered</option>
//             <option value="canceled">Canceled</option>
//           </select>
//         </div>
//         <div className="actions">
//           <button className="btn-secondary">
//             <i className="fas fa-download"></i> Export CSV
//           </button>
//           <button className="btn-secondary">
//             <i className="fas fa-print"></i> Print Labels
//           </button>
//         </div>
//       </div>

//       {/* Shipments Table */}
//       <div className="shipments-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Shipment ID</th>
//               <th>Tracking</th>
//               <th>Route</th>
//               <th>Service</th>
//               <th>Weight</th>
//               <th>Date</th>
//               <th>Est. Delivery</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredShipments.length === 0 ? (
//               <tr>
//                 <td colSpan="9" className="no-data">
//                   No shipments found. Try adjusting your filters.
//                 </td>
//               </tr>
//             ) : (
//               filteredShipments.map(ship => {
//                 const badge = getStatusBadge(ship.status);
//                 return (
//                   <tr key={ship.id}>
//                     <td>#{ship.id}</td>
//                     <td>
//                       <code>{ship.tracking}</code>
//                     </td>
//                     <td>
//                       <div className="route">
//                         <span className="from">{ship.from}</span>
//                         <span className="arrow">→</span>
//                         <span className="to">{ship.to}</span>
//                       </div>
//                     </td>
//                     <td>{ship.service}</td>
//                     <td>{ship.weight}</td>
//                     <td>{new Date(ship.date).toLocaleDateString()}</td>
//                     <td>
//                       {ship.estimatedDelivery 
//                         ? new Date(ship.estimatedDelivery).toLocaleDateString() 
//                         : '—'}
//                     </td>
//                     <td>
//                       <span className={`status-badge ${badge.color}`}>
//                         {badge.text}
//                       </span>
//                     </td>
//                     <td>
//                       <Link to={`/dashboard/tracking?tracking=${ship.tracking}`} className="btn-small">
//                         Track
//                       </Link>
//                       <button className="btn-small btn-secondary">Details</button>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination (optional) */}
//       <div className="pagination">
//         <button disabled>← Previous</button>
//         <span>Page 1 of 1</span>
//         <button disabled>Next →</button>
//       </div>
//     </div>
//   );
// };

// export default ShipmentsPage;




