// src/components/Dashboard/ReportPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './ReportPage.css';

const ReportPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0]
  });
  const [exporting, setExporting] = useState(false);

  // Fetch user's shipments
  useEffect(() => {
    if (!currentUser) return;

    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError('');

        const q = query(
          collection(db, 'shipments'),
          where('userId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          deliveredAt: doc.data().deliveredAt?.toDate() || null
        }));

        // Filter by date range
        const filtered = data.filter(ship => {
          const date = new Date(ship.createdAt);
          return date >= new Date(dateRange.start) && date <= new Date(dateRange.end);
        });

        setShipments(filtered);
      } catch (err) {
        console.error('Error fetching shipments:', err);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [currentUser, dateRange]);

  // Compute metrics
  const metrics = useMemo(() => {
    if (loading || !shipments.length) {
      return {
        total: 0,
        delivered: 0,
        inTransit: 0,
        pending: 0,
        canceled: 0,
        avgDeliveryTime: 0,
        onTimeRate: 0,
        topDestinations: [],
        serviceBreakdown: []
      };
    }

    const total = shipments.length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const inTransit = shipments.filter(s => s.status === 'in_transit').length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    const canceled = shipments.filter(s => s.status === 'canceled').length;

    // Avg delivery time (delivered only)
    const deliveredShipments = shipments.filter(s => s.status === 'delivered' && s.deliveredAt);
    const totalDays = deliveredShipments.reduce((sum, s) => {
      const diff = (s.deliveredAt - s.createdAt) / (1000 * 60 * 60 * 24);
      return sum + Math.max(0, diff);
    }, 0);
    const avgDeliveryTime = deliveredShipments.length > 0 
      ? (totalDays / deliveredShipments.length).toFixed(1) 
      : 0;

    // On-time delivery rate
    const onTime = deliveredShipments.filter(s => {
      const promised = new Date(s.estimatedDelivery);
      return s.deliveredAt <= promised;
    }).length;
    const onTimeRate = delivered > 0 ? Math.round((onTime / delivered) * 100) : 0;

    // Top destinations
    const destCount = {};
    shipments.forEach(s => {
      const dest = s.to?.country || 'Unknown';
      destCount[dest] = (destCount[dest] || 0) + 1;
    });
    const topDestinations = Object.entries(destCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Service breakdown
    const serviceCount = {};
    shipments.forEach(s => {
      const service = s.service || 'Unknown';
      serviceCount[service] = (serviceCount[service] || 0) + 1;
    });
    const serviceBreakdown = Object.entries(serviceCount)
      .map(([service, count]) => ({
        service,
        count,
        percentage: Math.round((count / total) * 100)
      }));

    return {
      total,
      delivered,
      inTransit,
      pending,
      canceled,
      avgDeliveryTime,
      onTimeRate,
      topDestinations,
      serviceBreakdown
    };
  }, [shipments, loading]);

  // Export to CSV
  const exportReport = async () => {
    if (shipments.length === 0) return;

    setExporting(true);
    try {
      const headers = [
        'ID', 'Tracking', 'From', 'To', 'Service', 'Status',
        'Created', 'Estimated Delivery', 'Delivered', 'Weight (kg)'
      ];

      const csvContent = [
        headers.join(','),
        ...shipments.map(ship => [
          ship.id,
          ship.tracking || '—',
          `${ship.from?.city || ''}, ${ship.from?.country || ''}`,
          `${ship.to?.city || ''}, ${ship.to?.country || ''}`,
          ship.service || '—',
          ship.status || '—',
          ship.createdAt?.toLocaleDateString() || '—',
          ship.estimatedDelivery || '—',
          ship.deliveredAt?.toLocaleDateString() || '—',
          ship.package?.weight || '—'
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SwiftParcel_Report_${dateRange.start}_to_${dateRange.end}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <div>
          <h1>Shipment Analytics</h1>
          <p>Performance insights and delivery trends</p>
        </div>
        <div className="header-actions">
          <div className="date-range">
            <label>From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <label>To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <button 
            className="btn-primarys"
            onClick={exportReport}
            disabled={exporting || shipments.length === 0}
          >
            {exporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              <>
                <i className="fas fa-file-export"></i> Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      )}

      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {!loading && !error && (
        <div className="report-content">
          {/* Summary Stats */}
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-value">{metrics.total}</div>
              <div className="stat-label">Total Shipments</div>
            </div>
            <div className="stat-card success">
              <div className="stat-value">{metrics.delivered}</div>
              <div className="stat-label">Delivered</div>
            </div>
            <div className="stat-card info">
              <div className="stat-value">{metrics.inTransit}</div>
              <div className="stat-label">In Transit</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{metrics.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">{metrics.canceled}</div>
              <div className="stat-label">Canceled</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="key-metrics">
            <div className="metric-card">
              <h3>Avg. Delivery Time</h3>
              <div className="metric-value">
                {metrics.avgDeliveryTime > 0 ? `${metrics.avgDeliveryTime} days` : '—'}
              </div>
              <div className="metric-desc">
                Time from creation to delivery
              </div>
            </div>
            <div className="metric-card">
              <h3>On-Time Rate</h3>
              <div className="metric-value">
                {metrics.onTimeRate}%
              </div>
              <div className="metric-desc">
                Delivered by estimated date
              </div>
            </div>
          </div>

          {/* Top Destinations */}
          <div className="report-section">
            <h2>Top Destinations</h2>
            <div className="destinations-grid">
              {metrics.topDestinations.length === 0 ? (
                <p className="no-data">No shipment data for this period.</p>
              ) : (
                metrics.topDestinations.map((dest, i) => (
                  <div key={dest.country} className="destination-card">
                    <div className="rank">{i + 1}</div>
                    <div className="country">
                      <span>{dest.country}</span>
                      <span className="count">{dest.count} shipments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="report-section">
            <h2>Service Usage</h2>
            <div className="service-breakdown">
              {metrics.serviceBreakdown.length === 0 ? (
                <p className="no-data">No service data available.</p>
              ) : (
                metrics.serviceBreakdown.map(service => (
                  <div key={service.service} className="service-item">
                    <div className="service-header">
                      <span>{service.service}</span>
                      <span>{service.percentage}%</span>
                    </div>
                    <div className="service-bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${service.percentage}%`,
                          backgroundColor: getServiceColor(service.service)
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Shipments Table */}
          <div className="report-section">
            <div className="section-header">
              <h2>Recent Shipments</h2>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/dashboard/shipments')}
              >
                View All
              </button>
            </div>
            <div className="shipments-table">
              <table>
                <thead>
                  <tr>
                    <th>Tracking</th>
                    <th>Route</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Delivered</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.slice(0, 5).map(ship => (
                    <tr key={ship.id}>
                      <td>
                        <code>{ship.tracking || '—'}</code>
                      </td>
                      <td>
                        {ship.from?.country || '—'} → {ship.to?.country || '—'}
                      </td>
                      <td>{ship.service || '—'}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(ship.status)}`}>
                          {ship.status || '—'}
                        </span>
                      </td>
                      <td>{ship.createdAt?.toLocaleDateString() || '—'}</td>
                      <td>{ship.deliveredAt?.toLocaleDateString() || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusClass = (status) => {
  const map = {
    delivered: 'success',
    'in_transit': 'info',
    pending: 'warning',
    canceled: 'danger'
  };
  return map[status] || 'warning';
};

const getServiceColor = (service) => {
  const colors = {
    Express: '#FF6B35',
    Global: '#3B82F6',
    Economy: '#10B981'
  };
  return colors[service] || '#64748b';
};

export default ReportPage;