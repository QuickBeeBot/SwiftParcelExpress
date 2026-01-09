// src/components/Dashboard/DashboardOverview.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  FileText,
  CreditCard,
  MapPin,
  TrendingUp
} from 'lucide-react';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const { currentUser } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError('');

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
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [currentUser]);

  const stats = useMemo(() => {
    if (loading || error) {
      return {
        total: 0,
        pending: 0,
        inTransit: 0,
        delivered: 0,
        canceled: 0,
        successRate: '0%',
        capacity: '0 kg'
      };
    }

    const total = shipments.length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    const inTransit = shipments.filter(s => s.status === 'in_transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const canceled = shipments.filter(s => s.status === 'canceled').length;
    const successRate = total > 0 ? `${Math.round((delivered / total) * 100)}%` : '0%';
    const totalWeight = shipments.reduce((sum, s) => sum + (parseFloat(s.package?.weight) || 0), 0);
    const capacity = `${totalWeight.toFixed(1)} kg`;

    return { total, pending, inTransit, delivered, canceled, successRate, capacity };
  }, [shipments, loading, error]);

  const recentShipments = useMemo(() => shipments.slice(0, 3), [shipments]);
  const isEmptyState = !loading && !error && shipments.length === 0;

  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <div className="dashboard-overview-container">
      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your logistics dashboard...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {/* Empty State */}
      {isEmptyState && (
        <div className="empty-dashboard">
          <div className="empty-header">
            <h2>Your Global Logistics Hub</h2>
            <p>Manage shipments, track deliveries, and scale your business — all in one place.</p>
          </div>

          {/* Quick Action Cards */}
          <div className="action-cards-grid">
            <div className="action-card" onClick={() => navigateTo('/dashboard/new-shipment')}>
              <Plus className="action-icon" />
              <h3>New Shipment</h3>
              <p>Create and schedule a new delivery</p>
            </div>
            <div className="action-card" onClick={() => navigateTo('/dashboard/tracking')}>
              <MapPin className="action-icon" />
              <h3>Track Shipment</h3>
              <p>Monitor real-time delivery status</p>
            </div>
            <div className="action-card" onClick={() => navigateTo('/dashboard/billing')}>
              <CreditCard className="action-icon" />
              <h3>Billing</h3>
              <p>View invoices and payment history</p>
            </div>
            <div className="action-card" onClick={() => navigateTo('/dashboard/documents')}>
              <FileText className="action-icon" />
              <h3>Documents</h3>
              <p>Access shipping labels & customs forms</p>
            </div>
          </div>

          <div className="empty-stats">
            <StatItem icon={<Package size={20} />} label="Total Shipments" value={stats.total} />
            <StatItem icon={<Clock size={20} />} label="Pending" value={stats.pending} />
            <StatItem icon={<Truck size={20} />} label="In Transit" value={stats.inTransit} />
            <StatItem icon={<CheckCircle size={20} />} label="Delivered" value={stats.delivered} />
            <StatItem icon={<XCircle size={20} />} label="Canceled" value={stats.canceled} />
          </div>

          <button 
            className="btn-dov-primary btn-large"
            onClick={() => navigateTo('/dashboard/new-shipment')}
          >
            <Plus size={20} /> Create Your First Shipment
          </button>
        </div>
      )}

      {/* Full Dashboard */}
      {!loading && !error && !isEmptyState && (
        <div className="overview-content">
          {/* Summary Stats */}
          <div className="summary-stats-grid">
            <SummaryStat 
              icon={<Package className="stat-icon" />}
              label="Total Shipments"
              value={stats.total}
              color="#36FFDB"
            />
            <SummaryStat 
              icon={<Clock className="stat-icon warning" />}
              label="Pending"
              value={stats.pending}
              color="#FFD700"
            />
            <SummaryStat 
              icon={<Truck className="stat-icon info" />}
              label="In Transit"
              value={stats.inTransit}
              color="#36FFDB"
            />
            <SummaryStat 
              icon={<CheckCircle className="stat-icon success" />}
              label="Delivered"
              value={stats.delivered}
              color="#4ADE80"
            />
            <SummaryStat 
              icon={<XCircle className="stat-icon danger" />}
              label="Canceled"
              value={stats.canceled}
              color="#F87171"
            />
            <SummaryStat 
              icon={<TrendingUp className="stat-icon" />}
              label="Success Rate"
              value={stats.successRate}
              color="#36FFDB"
            />
          </div>

          {/* Quick Actions Row */}
          <div className="quick-actions-row">
            <QuickAction 
              icon={<Plus />}
              title="New Shipment"
              onClick={() => navigateTo('/dashboard/new-shipment')}
            />
            <QuickAction 
              icon={<MapPin />}
              title="Track Shipment"
              onClick={() => navigateTo('/dashboard/tracking')}
            />
            <QuickAction 
              icon={<CreditCard />}
              title="Billing"
              onClick={() => navigateTo('/dashboard/billing')}
            />
            <QuickAction 
              icon={<FileText />}
              title="Documents"
              onClick={() => navigateTo('/dashboard/documents')}
            />
          </div>

          {/* Recent Shipments */}
          <div className="section">
            <div className="section-header">
              <h2>Recent Shipments</h2>
              <a href="/dashboard/shipments" className="view-all-link">View All</a>
            </div>
            <div className="recent-shipments-placeholder">
              <p>Shipment list component will render here.</p>
            </div>
          </div>

          {/* Placeholder for Tracking & Package Details */}
          <div className="middle-row">
            <div className="card">
              <h3>Live Tracking</h3>
              <p>Real-time GPS updates coming soon.</p>
            </div>
            <div className="card">
              <h3>Package Insights</h3>
              <p>Weight, dimensions, and customs data.</p>
            </div>
          </div>

          {/* Map */}
          <div className="map-card">
            <h3>Global Delivery Network</h3>
            <div className="map-placeholder">
              <MapPin size={48} className="map-icon" />
              <p>Live route visualization powered by SwiftParcel Intelligence™</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Stat Item (for empty state)
const StatItem = ({ icon, label, value }) => (
  <div className="stat-item">
    {icon}
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

// Reusable Summary Stat Card
const SummaryStat = ({ icon, label, value, color }) => (
  <div className="summary-stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-icon-wrapper" style={{ color }}>
      {icon}
    </div>
    <div className="stat-text">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

// Reusable Quick Action Button
const QuickAction = ({ icon, title, onClick }) => (
  <button className="quick-action-card" onClick={onClick}>
    <div className="qa-icon">{icon}</div>
    <span>{title}</span>
  </button>
);

export default DashboardOverview;

// // src/components/Dashboard/DashboardOverview.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// // import { useAuth } from '../../contexts/FirebaseAuthContext';
// import { useAuth } from '../../contexts/FirebaseAuthContext';
// import { db } from '../../lib/firebase';
// import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
// import StatCard from './StatCard';
// import ShipmentList from './ShipmentList';
// import TrackingHistory from './TrackingHistory';
// import PackageDetails from './PackageDetails';
// import './DashboardOverview.css';

// const DashboardOverview = () => {
//   const { currentUser } = useAuth();
//   const [shipments, setShipments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Fetch user's shipments
//   useEffect(() => {
//     if (!currentUser) return;

//     const fetchShipments = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         const q = query(
//           collection(db, 'shipments'),
//           where('userId', '==', currentUser.uid),
//           orderBy('createdAt', 'desc')
//         );

//         const querySnapshot = await getDocs(q);
//         const data = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           createdAt: doc.data().createdAt?.toDate() || new Date()
//         }));

//         setShipments(data);
//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//         setError('Failed to load dashboard data. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShipments();
//   }, [currentUser]);

//   // Compute stats from live data
//   const stats = useMemo(() => {
//     if (loading) {
//       return {
//         total: 0,
//         pending: 0,
//         inTransit: 0,
//         delivered: 0,
//         canceled: 0,
//         successRate: '0%',
//         capacity: '0 kg'
//       };
//     }

//     if (error) {
//       // Keep default 0s on error — don’t break UI
//       return {
//         total: 0,
//         pending: 0,
//         inTransit: 0,
//         delivered: 0,
//         canceled: 0,
//         successRate: '0%',
//         capacity: '0 kg'
//       };
//     }

//     const total = shipments.length;
//     const pending = shipments.filter(s => s.status === 'pending').length;
//     const inTransit = shipments.filter(s => s.status === 'in_transit').length;
//     const delivered = shipments.filter(s => s.status === 'delivered').length;
//     const canceled = shipments.filter(s => s.status === 'canceled').length;

//     const successRate = total > 0 
//       ? `${Math.round((delivered / total) * 100)}%`
//       : '0%';

//     const totalWeight = shipments.reduce((sum, s) => {
//       return sum + (parseFloat(s.package?.weight) || 0);
//     }, 0);
//     const capacity = `${totalWeight.toFixed(1)} kg`;

//     return {
//       total,
//       pending,
//       inTransit,
//       delivered,
//       canceled,
//       successRate,
//       capacity
//     };
//   }, [shipments, loading, error]);

//   // Get recent shipments (last 3)
//   const recentShipments = useMemo(() => {
//     return shipments.slice(0, 3);
//   }, [shipments]);

//   // Render empty state UI if no shipments
//   const isEmptyState = !loading && !error && shipments.length === 0;

//   return (
//     <div className="dashboard-layout">
//       <main className="dashboard-main">
//         <div className="dashboard-content">
//           {/* Header */}
//           {/* <div className="page-header">
//             <h1>Welcome back, {currentUser?.displayName || currentUser?.email.split('@')[0] || 'User'}!</h1>
//             <button 
//               className="btn-dov-primarys"
//               onClick={() => window.location.href = '/dashboard/new-shipment'}
//             >
//               <i className="fas fa-plus"></i> Create Shipment
//             </button>
//           </div> */}

//           {/* Loading State */}
//           {loading && (
//             <div className="loading-state">
//               <div className="spinner"></div>
//               <p>Loading dashboard...</p>
//             </div>
//           )}

//           {/* Error State */}
//           {error && (
//             <div className="alert error">
//               ❌ {error}
//             </div>
//           )}

//           {/* Empty State (No Shipments) */}
//           {isEmptyState && (
//             <div className="empty-dashboard">
//               <div className="empty-header">
//                 <h2>Get Started</h2>
//                 <p>Your journey to global shipping starts here.</p>
//               </div>

//               <div className="stat-cards-grid">
//                 <StatCard title="Total Shipments" value={stats.total} trend="—"/>
//                 <StatCard title="Pending" value={stats.pending} trend="—"/>
//                 <StatCard title="In Transit" value={stats.inTransit} trend="—"/>
//                 <StatCard title="Delivered" value={stats.delivered} trend="—"/>
//                 <StatCard title="Canceled" value={stats.canceled} trend="—"/>
//                 {/* <StatCard title="Success Rate" value={stats.successRate} trend="—"/>
//                 <StatCard title="Capacity Used" value={stats.capacity} trend="—"/> */}
//               </div>

//               <div className="empty-action">
//                 <div className="empty-icon">📦</div>
//                 <h3>You haven’t created any shipments yet.</h3>
//                 <p>Get started by creating your first shipment — it takes less than 60 seconds.</p>
//                 <button 
//                   className="btn-dov-primarys btn-large"
//                   onClick={() => window.location.href = '/dashboard/new-shipment'}
//                 >
//                   <i className="fas fa-plus"></i> Create Your First Shipment
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Full Data View */}
//           {!loading && !error && !isEmptyState && (
//             <div className="overview-content">
//               {/* Summary Stats */}
//               <div className="summary-stats">
//                 <div className="stat-card">
//                   <div className="stat-value">{stats.total}</div>
//                   <div className="stat-label">Total Shipments</div>
//                 </div>
//                 <div className="stat-card warning">
//                   <div className="stat-value">{stats.pending}</div>
//                   <div className="stat-label">Pending</div>
//                 </div>
//                 <div className="stat-card info">
//                   <div className="stat-value">{stats.inTransit}</div>
//                   <div className="stat-label">In Transit</div>
//                 </div>
//                 <div className="stat-card success">
//                   <div className="stat-value">{stats.delivered}</div>
//                   <div className="stat-label">Delivered</div>
//                 </div>
//                 <div className="stat-card danger">
//                   <div className="stat-value">{stats.canceled}</div>
//                   <div className="stat-label">Canceled</div>
//                 </div>
//               </div>

//               {/* Recent Shipments */}
//               <div className="section">
//                 <div className="section-header">
//                   <h2>Recent Shipments</h2>
//                   <a href="/dashboard/shipments" className="view-all-link">
//                     View All
//                   </a>
//                 </div>
//                 <ShipmentList shipments={recentShipments} />
//               </div>

//               {/* Middle Row */}
//               <div className="middle-row">
//                 <div className="left-column">
//                   <TrackingHistory />
//                 </div>
//                 <div className="right-column">
//                   <PackageDetails />
//                 </div>
//               </div>

//               {/* Map Card */}
//               <div className="bottom-row">
//                 <div className="map-card">
//                   <h3>Delivery Route</h3>
//                   <div className="map-container">
//                     <img 
//                       src="https://maps.googleapis.com/maps/api/staticmap?center=London,UK&zoom=4&size=800x400&maptype=roadmap&markers=color:red%7CLondon,UK&markers=color:green%7CParis,FR&path=color:0xFF6B35|weight:4|London,UK|Paris,FR&key=YOUR_API_KEY" 
//                       alt="Delivery Map" 
//                       onError={(e) => {
//                         e.target.src = "https://via.placeholder.com/800x400/1a2d4b/0a1f44?text=Live+Route+Map";
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DashboardOverview;





