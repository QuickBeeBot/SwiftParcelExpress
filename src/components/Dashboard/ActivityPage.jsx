// src/components/Dashboard/ActivityPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  limit,
  startAfter
} from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './ActivityPage.css';

const ActivityPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });

  // Fetch activities
  const fetchActivities = useCallback(async (reset = false) => {
    if (!currentUser) return;

    try {
      if (reset) setLoading(true);
      setError('');

      // Build query
      let q = query(
        collection(db, 'activities'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      if (!reset && lastVisible && hasMore) {
        q = query(
          collection(db, 'activities'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          startAfter(lastVisible),
          limit(20)
        );
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      if (reset) {
        setActivities(data);
        setHasMore(querySnapshot.docs.length === 20);
      } else if (data.length > 0) {
        setActivities(prev => [...prev, ...data]);
        setHasMore(querySnapshot.docs.length === 20);
      }

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity log. Please try again.');
    } finally {
      if (reset) setLoading(false);
    }
  }, [currentUser, lastVisible, hasMore]);

  useEffect(() => {
    fetchActivities(true);
  }, [fetchActivities]);

  // Auto-refresh
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchActivities(true);
      }, 30000); // 30 sec
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchActivities]);

  // Get icon by action type
  const getIcon = (action) => {
    const icons = {
      'Shipment Created': '📦',
      'Package Picked Up': '🚚',
      'In Transit': '📍',
      'Customs Cleared': '🛃',
      'Out for Delivery': '🚴',
      'Delivered': ' ',
      'Order Placed': '🛒',
      'Invoice Generated': '🧾',
      'Payment Received': '💰',
      'User Login': '👤',
      'Profile Updated': '📝'
    };
    return icons[action] || 'ℹ️';
  };

  // Export to CSV
  const exportToCSV = async () => {
    if (activities.length === 0) return;

    setExporting(true);
    try {
      // Optional: fetch full log (not just first 20)
      const fullQ = query(
        collection(db, 'activities'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const fullSnapshot = await getDocs(fullQ);
      const fullData = fullSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      const dataToExport = fullData.length > 0 ? fullData : activities;

      const headers = ['Timestamp', 'Action', 'Description', 'IP Address', 'Location'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(a => [
          `"${new Date(a.timestamp).toLocaleString()}"`,
          `"${a.action}"`,
          `"${a.description}"`,
          `"${a.ipAddress || '—'}"`,
          `"${a.location || '—'}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `swiftparcel_activity_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export activity log.');
    } finally {
      setExporting(false);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(a => {
    const matchesType = filters.type === 'all' || a.action.includes(filters.type);
    const date = new Date(a.timestamp);
    const matchesStart = !filters.startDate || date >= new Date(filters.startDate);
    const matchesEnd = !filters.endDate || date <= new Date(filters.endDate);
    return matchesType && matchesStart && matchesEnd;
  });

  return (
    <div className="activity-page">
      <div className="page-header">
        <div>
          <h1>Activity Log</h1>
          <p>Real-time tracking of all your account and shipment events</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh (30s)'}
          >
            <i className={`fas fa-sync ${autoRefresh ? 'spin' : ''}`}></i>
            {autoRefresh ? 'Auto' : 'Manual'}
          </button>
          <button 
            className="btn-primary"
            onClick={exportToCSV}
            disabled={exporting || activities.length === 0}
          >
            {exporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              <>
                <i className="fas fa-file-export"></i> Export Log
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Type:</label>
          <select 
            value={filters.type} 
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">All Activities</option>
            <option value="Shipment">Shipment</option>
            <option value="Order">Order</option>
            <option value="Payment">Payment</option>
            <option value="Login">Login</option>
          </select>
        </div>
        <div className="filter-group">
          <label>From:</label>
          <input 
            type="date" 
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>To:</label>
          <input 
            type="date" 
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
        <button 
          className="btn-secondary"
          onClick={() => setFilters({ type: 'all', startDate: '', endDate: '' })}
        >
          Reset
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
          <p>Loading activity log...</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && (
        <div className="activity-timeline">
          {filteredActivities.length === 0 ? (
            <div className="empty-state">
              {/* <div className="empty-icon">📊</div> */}
              <h3>No activity yet</h3>
              <p>Your activity log will appear here as you use SwiftParcel.</p>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/dashboard/new-shipment')}
              >
                Create Your First Shipment
              </button>
            </div>
          ) : (
            filteredActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getIcon(activity.action)}
                </div>
                <div className="activity-details">
                  <div className="activity-header">
                    <h3>{activity.action}</h3>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p>{activity.description}</p>
                  {(activity.ipAddress || activity.location) && (
                    <div className="activity-meta">
                      {activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
                      {activity.location && <span>📍 {activity.location}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Load More */}
          {hasMore && filteredActivities.length > 0 && (
            <div className="load-more">
              <button 
                className="btn-secondary" 
                onClick={() => fetchActivities(false)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;







// // src/components/Dashboard/ActivityPage.jsx
// import React, { useState, useEffect } from 'react';
// import './ActivityPage.css';

// const ActivityPage = () => {
//   const [activities, setActivities] = useState([
//     {
//       id: 1,
//       action: 'Shipment Created',
//       description: 'Order ORD2025001 created for John Doe',
//       time: '2025-06-01 08:30',
//       icon: ' '
//     },
//     {
//       id: 2,
//       action: 'Package Picked Up',
//       description: 'Package SP1001XYZ picked up from London Hub',
//       time: '2025-06-01 14:15',
//       icon: ' '
//     },
//     {
//       id: 3,
//       action: 'Customs Cleared',
//       description: 'Shipment SP1001XYZ cleared customs in Dubai',
//       time: '2025-06-02 03:45',
//       icon: ' '
//     },
//     {
//       id: 4,
//       action: 'Delivered',
//       description: 'Package SP1001XYZ delivered to San Diego, USA',
//       time: '2025-06-03 10:20',
//       icon: ' '
//     }
//   ]);

//   return (
//     <div className="activity-page">
//       <div className="page-header">
//         <h1>Activity</h1>
//         <button className="btn-primarys">Export Log</button>
//       </div>

//       <div className="activity-timeline">
//         {activities.map(activity => (
//           <div key={activity.id} className="activity-item">
//             <div className="activity-icon">{activity.icon}</div>
//             <div className="activity-details">
//               <h3>{activity.action}</h3>
//               <p>{activity.description}</p>
//               <div className="activity-time">{activity.time}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ActivityPage;




