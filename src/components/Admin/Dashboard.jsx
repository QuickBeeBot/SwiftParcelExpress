// src/components/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit
} from 'firebase/firestore';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Ticket,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Calendar,
  MapPin
} from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalShipments: 0,
    pendingReview: 0,
    inTransit: 0,
    delivered: 0,
    ticketsOpen: 0,
    totalUsers: 0,
    revenue: '$0.00',
    successRate: '0%',
    avgProcessingTime: '0h'
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          shipmentsSnap,
          ticketsSnap,
          usersSnap
        ] = await Promise.all([
          getDocs(collection(db, 'shipments')),
          getDocs(query(
            collection(db, 'tickets'),
            where('status', 'in', ['open', 'in_progress'])
          )),
          getDocs(collection(db, 'users'))
        ]);

        const shipments = shipmentsSnap.docs.map(d => d.data());
        const totalShipments = shipments.length;
        const pendingReview = shipments.filter(s => s.status === 'pending_review').length;
        const inTransit = shipments.filter(s => s.status === 'in_transit').length;
        const delivered = shipments.filter(s => s.status === 'delivered').length;
        const canceled = shipments.filter(s => s.status === 'canceled').length;
        const successRate = totalShipments > 0 
          ? `${Math.round((delivered / totalShipments) * 100)}%`
          : '0%';

        // Mock advanced metrics (replace with real logic in production)
        const avgProcessingTime = '4.2h'; // average time from request to quote
        const revenue = '$12,450.00';

        setStats({
          totalShipments,
          pendingReview,
          inTransit,
          delivered,
          ticketsOpen: ticketsSnap.size,
          totalUsers: usersSnap.size,
          revenue,
          successRate,
          avgProcessingTime
        });

        // Recent Activity
        const activitySnap = await getDocs(query(
          collection(db, 'shipments'),
          orderBy('createdAt', 'desc'),
          limit(6)
        ));
        const recentActivity = activitySnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || new Date()
        }));
        setActivity(recentActivity);

      } catch (err) {
        console.error('Admin dashboard load failed:', err);
        setError('Failed to load admin data. Please check permissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <AdminSkeleton />;
  if (error) return <div className="admin-error">{error}</div>;

  // Status badge renderer
  const renderStatusBadge = (status) => {
    const config = {
      pending_review: { text: 'Pending Review', color: 'warning' },
      in_transit: { text: 'In Transit', color: 'info' },
      delivered: { text: 'Delivered', color: 'success' },
      canceled: { text: 'Canceled', color: 'danger' }
    };
    const { text, color } = config[status] || { text: status, color: 'default' };
    return <span className={`status-badge ${color}`}>{text}</span>;
  };

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Operations Dashboard</h1>
        <p>Real-time insights into your global logistics network.</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Shipments" 
          value={stats.totalShipments} 
          icon={<Package size={24} />}
          trend="+12% from last week"
        />
        <MetricCard 
          title="Pending Review" 
          value={stats.pendingReview} 
          icon={<Clock size={24} />}
          trend="Requires attention"
          color="#F59E0B"
        />
        <MetricCard 
          title="In Transit" 
          value={stats.inTransit} 
          icon={<Truck size={24} />}
          trend="+8% active routes"
          color="#36FFDB"
        />
        <MetricCard 
          title="Delivered" 
          value={stats.delivered} 
          icon={<CheckCircle size={24} />}
          trend="98% on-time"
          color="#10B981"
        />
        <MetricCard 
          title="Success Rate" 
          value={stats.successRate} 
          icon={<TrendingUp size={24} />}
          trend="Industry benchmark: 92%"
          color="#36FFDB"
        />
        <MetricCard 
          title="Avg. Processing Time" 
          value={stats.avgProcessingTime} 
          icon={<Activity size={24} />}
          trend="Target: <6h"
          color="#8B5CF6"
        />
        <MetricCard 
          title="Active Users" 
          value={stats.totalUsers} 
          icon={<Users size={24} />}
          trend="+24 new this week"
          color="#36FFDB"
        />
        <MetricCard 
          title="Open Support Tickets" 
          value={stats.ticketsOpen} 
          icon={<Ticket size={24} />}
          trend="Critical: 2 high-priority"
          color="#EF4444"
        />
      </div>

      {/* Recent Activity */}
      <div className="section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="activity-list">
          {activity.length === 0 ? (
            <div className="no-activity">
              <Package size={48} className="empty-icon" />
              <p>No recent shipment activity</p>
            </div>
          ) : (
            activity.map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon">
                  <Package size={20} />
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <strong>New shipment request</strong> from {item.from?.name || '—'}
                  </div>
                  <div className="activity-details">
                    <span>#{item.trackingNumber || item.id.slice(0, 8)}</span>
                    <span>{item.package?.weight ? `${item.package.weight} kg` : ''}</span>
                    <span><MapPin size={14} /> {item.to?.city || '—'}, {item.to?.country || '—'}</span>
                  </div>
                  <div className="activity-footer">
                    <span className="timestamp">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
                <button className="quick-action">Review</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Metric Card
const MetricCard = ({ title, value, icon, trend, color = '#36FFDB' }) => (
  <div className="metric-card" style={{ borderLeftColor: color }}>
    <div className="metric-icon" style={{ color }}>
      {icon}
    </div>
    <div className="metric-content">
      <div className="metric-value">{value}</div>
      <div className="metric-title">{title}</div>
      <div className="metric-trend">{trend}</div>
    </div>
  </div>
);

// Loading Skeleton
const AdminSkeleton = () => (
  <div className="admin-dashboard">
    <div className="page-header">
      <div className="skeleton h-8 w-64 mb-2"></div>
      <div className="skeleton h-5 w-96"></div>
    </div>
    <div className="metrics-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="metric-card skeleton-card">
          <div className="skeleton h-8 w-8 rounded-full"></div>
          <div className="metric-content">
            <div className="skeleton h-6 w-16 mb-1"></div>
            <div className="skeleton h-4 w-24"></div>
            <div className="skeleton h-3 w-32 mt-2"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="section">
      <div className="section-header">
        <div className="skeleton h-6 w-48"></div>
      </div>
      <div className="activity-list">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="activity-item skeleton">
            <div className="skeleton h-10 w-10 rounded-full"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-3/4 mb-2"></div>
              <div className="skeleton h-3 w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminDashboard;