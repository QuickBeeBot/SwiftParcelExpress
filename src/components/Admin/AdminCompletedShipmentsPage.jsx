// src/components/Admin/AdminCompletedShipmentsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import './AdminCompletedShipmentsPage.css';

const AdminCompletedShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('30'); // '7', '30', '90', 'all'
  const [exporting, setExporting] = useState(false);

  // Fetch completed shipments: delivered, canceled
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError('');

        let q = query(
          collection(db, 'shipments'),
          where('status', 'in', ['delivered', 'canceled']),
          orderBy('deliveredAt', 'desc')
        );

        // Apply date filter
        if (filterDate !== 'all') {
          const days = parseInt(filterDate);
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          q = query(
            collection(db, 'shipments'),
            where('status', 'in', ['delivered', 'canceled']),
            where('deliveredAt', '>=', cutoff),
            orderBy('deliveredAt', 'desc')
          );
        }

        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          deliveredAt: doc.data().deliveredAt?.toDate() || null,
          canceledAt: doc.data().canceledAt?.toDate() || null
        }));

        setShipments(data);
      } catch (err) {
        console.error('Failed to load completed shipments:', err);
        setError('Failed to load completed shipments.');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [filterDate]);

  // Metrics
  const metrics = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const canceled = shipments.filter(s => s.status === 'canceled').length;
    
    // Avg delivery time (delivered only)
    const deliveredShipments = shipments.filter(s => s.status === 'delivered' && s.deliveredAt);
    const totalDays = deliveredShipments.reduce((sum, s) => {
      const diff = (s.deliveredAt - s.createdAt) / (1000 * 60 * 60 * 24);
      return sum + Math.max(0, diff);
    }, 0);
    const avgDeliveryTime = deliveredShipments.length > 0 
      ? (totalDays / deliveredShipments.length).toFixed(1) 
      : '—';

    // On-time rate
    const onTime = deliveredShipments.filter(s => {
      const promised = new Date(s.estimatedDelivery);
      return s.deliveredAt <= promised;
    }).length;
    const onTimeRate = delivered > 0 ? Math.round((onTime / delivered) * 100) : '—';

    // Avg rating (if feedback exists)
    const ratings = shipments
      .filter(s => s.feedback?.rating)
      .map(s => s.feedback.rating);
    const avgRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : '—';

    return {
      total,
      delivered,
      canceled,
      avgDeliveryTime,
      onTimeRate,
      avgRating
    };
  }, [shipments]);

  // Filter & search
  const filteredShipments = useMemo(() => {
    return shipments.filter(ship => {
      const matchesSearch = 
        ship.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ship.from?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ship.to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ship.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || ship.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, filterStatus]);

  // Export to CSV
  const exportCSV = async () => {
    if (shipments.length === 0) return;

    setExporting(true);
    try {
      const headers = [
        'ID', 'Tracking', 'Status', 'From', 'To', 'Service',
        'Weight (kg)', 'Revenue ($)', 'Created',
        'Delivered/Canceled', 'Transit Time (days)', 'On-Time',
        'Rating', 'Feedback'
      ];

      const csvContent = [
        headers.join(','),
        ...filteredShipments.map(ship => {
          const created = new Date(ship.createdAt);
          const completed = ship.deliveredAt || ship.canceledAt;
          const transitDays = completed 
            ? Math.ceil((completed - created) / (1000 * 60 * 60 * 24))
            : '—';
          
          const promised = ship.estimatedDelivery ? new Date(ship.estimatedDelivery) : null;
          const onTime = promised && completed && completed <= promised ? 'Yes' : 'No';

          return [
            ship.id,
            ship.trackingNumber || '—',
            ship.status,
            `${ship.from?.city || ''}, ${ship.from?.country || ''}`,
            `${ship.to?.city || ''}, ${ship.to?.country || ''}`,
            ship.service || '—',
            ship.package?.weight || '—',
            ship.quote?.total || '0',
            created.toLocaleDateString(),
            completed ? completed.toLocaleDateString() : '—',
            transitDays,
            onTime,
            ship.feedback?.rating || '—',
            `"${(ship.feedback?.comment || '').replace(/"/g, '""')}"`.substring(0, 100)
          ].map(field => `"${field}"`).join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SwiftParcel_Completed_Shipments_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    return date 
      ? new Date(date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : '—';
  };

  // Status badge
  const getStatusBadge = (status) => {
    const config = {
      delivered: { text: 'Delivered', color: 'success' },
      canceled: { text: 'Canceled', color: 'danger' }
    };
    return config[status] || { text: status, color: 'secondary' };
  };

  // Rating display
  const renderRating = (rating) => {
    if (!rating) return '—';
    return (
      <div className="rating">
        {'★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))}
        <span className="rating-value">{rating}</span>
      </div>
    );
  };

  return (
    <div className="admin-completed-shipments">
      <div className="page-header">
        <h1>Completed Shipments</h1>
        <p>Review delivered and canceled shipments with performance analytics</p>
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
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date Range:</label>
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
        <button 
          className="btn-export"
          onClick={exportCSV}
          disabled={exporting || filteredShipments.length === 0}
        >
          <i className="fas fa-file-export"></i>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Error & Loading */}
      {error && <div className="alert error">❌ {error}</div>}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading completed shipments...</p>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="metrics-grid">
            <div className="metric-card success">
              <div className="metric-value">{metrics.delivered}</div>
              <div className="metric-label">Delivered</div>
            </div>
            <div className="metric-card danger">
              <div className="metric-value">{metrics.canceled}</div>
              <div className="metric-label">Canceled</div>
            </div>
            <div className="metric-card info">
              <div className="metric-value">{metrics.avgDeliveryTime} days</div>
              <div className="metric-label">Avg. Transit Time</div>
            </div>
            <div className="metric-card warning">
              <div className="metric-value">{metrics.onTimeRate}%</div>
              <div className="metric-label">On-Time Rate</div>
            </div>
            <div className="metric-card primary">
              <div className="metric-value">{metrics.avgRating}/5</div>
              <div className="metric-label">Avg. Rating</div>
            </div>
          </div>

          {/* Shipments Table */}
          <div className="shipments-table">
            <table>
              <thead>
                <tr>
                  <th>Tracking</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Completed</th>
                  <th>Transit</th>
                  <th>On-Time</th>
                  <th>Rating</th>
                  <th>Revenue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No completed shipments found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map(ship => {
                    const badge = getStatusBadge(ship.status);
                    const created = new Date(ship.createdAt);
                    const completed = ship.deliveredAt || ship.canceledAt;
                    const transitDays = completed 
                      ? Math.ceil((completed - created) / (1000 * 60 * 60 * 24))
                      : '—';
                    
                    const promised = ship.estimatedDelivery ? new Date(ship.estimatedDelivery) : null;
                    const onTime = promised && completed && completed <= promised 
                      ? 'Yes' : 'No';

                    return (
                      <tr key={ship.id}>
                        <td>
                          <code>{ship.trackingNumber || '—'}</code>
                        </td>
                        <td>
                          {ship.from?.city || '—'} → {ship.to?.city || '—'}
                        </td>
                        <td>
                          <span className={`status-badge ${badge.color}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td>{formatDate(completed)}</td>
                        <td>{transitDays} days</td>
                        <td>
                          <span className={`on-time ${onTime === 'Yes' ? 'yes' : 'no'}`}>
                            {onTime}
                          </span>
                        </td>
                        <td>{renderRating(ship.feedback?.rating)}</td>
                        <td>${(ship.quote?.total || 0).toFixed(2)}</td>
                        <td>
                          <button className="btn-view">
                            <i className="fas fa-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Performance Summary */}
          {metrics.total > 0 && (
            <div className="performance-summary">
              <h2>Performance Summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <h3>Delivery Performance</h3>
                  <div className="chart">
                    <div className="chart-bar">
                      <div 
                        className="bar-fill success" 
                        style={{ width: `${metrics.onTimeRate || 0}%` }}
                      ></div>
                      <span className="bar-label">{metrics.onTimeRate || 0}% on-time</span>
                    </div>
                  </div>
                </div>
                <div className="summary-item">
                  <h3>Cancellation Rate</h3>
                  <div className="chart">
                    <div className="chart-bar">
                      <div 
                        className="bar-fill danger" 
                        style={{ width: `${metrics.canceled > 0 ? (metrics.canceled / metrics.total * 100) : 0}%` }}
                      ></div>
                      <span className="bar-label">
                        {(metrics.canceled / metrics.total * 100).toFixed(1)}% canceled
                      </span>
                    </div>
                  </div>
                </div>
                <div className="summary-item">
                  <h3>Top Destinations</h3>
                  <div className="destinations">
                    {(() => {
                      const destCount = {};
                      shipments.filter(s => s.status === 'delivered').forEach(s => {
                        const dest = s.to?.country || 'Unknown';
                        destCount[dest] = (destCount[dest] || 0) + 1;
                      });
                      return Object.entries(destCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([country, count], i) => (
                          <div key={country} className="destination">
                            <span className="rank">{i + 1}</span>
                            <span>{country}</span>
                            <span>{count}</span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCompletedShipmentsPage;