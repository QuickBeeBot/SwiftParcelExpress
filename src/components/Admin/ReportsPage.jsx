// src/components/Admin/ReportsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './ReportsPage.css';

const ReportsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0]
  });
  const [exporting, setExporting] = useState(false);
  const [groupBy, setGroupBy] = useState('day'); // 'day', 'week', 'month'

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const q = query(
          collection(db, 'shipments'),
          where('createdAt', '>=', new Date(dateRange.start)),
          where('createdAt', '<=', new Date(dateRange.end)),
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
        console.error('Reports load failed:', err);
        setError('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Compute metrics
  const metrics = useMemo(() => {
    if (loading) return { total: 0, revenue: 0, avgDelivery: 0, onTimeRate: 0 };

    const total = shipments.length;
    const revenue = shipments.reduce((sum, s) => sum + (s.quote?.total || 0), 0);
    const avgDelivery = shipments.length > 0 
      ? (shipments.reduce((sum, s) => {
          if (s.deliveredAt && s.createdAt) {
            return sum + (new Date(s.deliveredAt) - new Date(s.createdAt)) / (1000 * 60 * 60 * 24);
          }
          return sum;
        }, 0) / shipments.filter(s => s.deliveredAt).length) || 0
      : 0;

    const onTime = shipments.filter(s => {
      if (s.status !== 'delivered' || !s.deliveredAt) return false;
      const promised = new Date(s.estimatedDelivery);
      return new Date(s.deliveredAt) <= promised;
    }).length;
    const onTimeRate = total > 0 ? Math.round((onTime / total) * 100) : 0;

    return {
      total,
      revenue: revenue.toFixed(2),
      avgDelivery: avgDelivery.toFixed(1),
      onTimeRate
    };
  }, [shipments, loading]);

  // Group data for charts (optional)
  const groupedData = useMemo(() => {
    if (loading || !shipments.length) return [];

    const groups = {};
    shipments.forEach(ship => {
      let key;
      const date = new Date(ship.createdAt);
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const d = new Date(date);
          d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
          key = `Week ${d.getDate()}/${d.getMonth() + 1}`;
          break;
        case 'month':
          key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.entries(groups).map(([label, count]) => ({ label, count }));
  }, [shipments, loading, groupBy]);

  // Export to CSV
  const exportCSV = async () => {
    if (shipments.length === 0) return;

    setExporting(true);
    try {
      const headers = [
        'ID', 'Tracking', 'From', 'To', 'Status',
        'Service', 'Weight (kg)', 'Revenue ($)', 'Created',
        'Estimated Delivery', 'Delivered'
      ];

      const csvContent = [
        headers.join(','),
        ...shipments.map(ship => [
          ship.id,
          ship.trackingNumber || '—',
          `${ship.from?.city || ''}, ${ship.from?.country || ''}`,
          `${ship.to?.city || ''}, ${ship.to?.country || ''}`,
          ship.status || '—',
          ship.service || '—',
          ship.package?.weight || '—',
          ship.quote?.total || '0',
          ship.createdAt?.toLocaleDateString() || '—',
          ship.estimatedDelivery || '—',
          ship.deliveredAt?.toLocaleDateString() || '—'
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SwiftParcel_Admin_Report_${dateRange.start}_to_${dateRange.end}.csv`);
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

  // Export to PDF (print-friendly)
  const exportPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>SwiftParcel Admin Report</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; color: #FF6B35; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f1f3f4; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SwiftParcel Admin Report</h1>
            <p>${dateRange.start} to ${dateRange.end}</p>
          </div>
          
          <div class="metrics">
            <div class="metric">
              <div>Total Shipments</div>
              <div class="metric-value">${metrics.total}</div>
            </div>
            <div class="metric">
              <div>Revenue</div>
              <div class="metric-value">$${metrics.revenue}</div>
            </div>
            <div class="metric">
              <div>Avg. Delivery (days)</div>
              <div class="metric-value">${metrics.avgDelivery}</div>
            </div>
            <div class="metric">
              <div>On-Time Rate</div>
              <div class="metric-value">${metrics.onTimeRate}%</div>
            </div>
          </div>

          <h2>Shipments (${shipments.length})</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tracking</th>
                <th>Route</th>
                <th>Status</th>
                <th>Revenue</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${shipments.map(ship => `
                <tr>
                  <td>${ship.id.substring(0, 6)}</td>
                  <td>${ship.trackingNumber || '—'}</td>
                  <td>${ship.from?.country || '—'} → ${ship.to?.country || '—'}</td>
                  <td>${ship.status || '—'}</td>
                  <td>$${(ship.quote?.total || 0).toFixed(2)}</td>
                  <td>${ship.createdAt?.toLocaleDateString() || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
    <div className="reports-page">
      <div className="page-header">
        <h1>Admin Reports</h1>
        <p>Performance insights and business analytics</p>
      </div>

      {/* Controls */}
      <div className="report-controls">
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
        <div className="group-by">
          <label>Group By:</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        <div className="export-actions">
          <button 
            className="btn-secondary"
            onClick={exportCSV}
            disabled={exporting || shipments.length === 0}
          >
            <i className="fas fa-file-csv"></i> Export CSV
          </button>
          <button 
            className="btn-secondary"
            onClick={exportPDF}
            disabled={shipments.length === 0}
          >
            <i className="fas fa-file-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      {/* Error & Loading */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="report-content">
          {/* Key Metrics */}
          <div className="key-metrics">
            <div className="metric-card">
              <div className="metric-icon"><i className="fas fa-boxes"></i></div>
              <div>
                <div className="metric-value">{metrics.total}</div>
                <div className="metric-label">Total Shipments</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="fas fa-dollar-sign"></i></div>
              <div>
                <div className="metric-value">${metrics.revenue}</div>
                <div className="metric-label">Revenue</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="fas fa-truck"></i></div>
              <div>
                <div className="metric-value">{metrics.avgDelivery} days</div>
                <div className="metric-label">Avg. Delivery Time</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><i className="fas fa-check-circle"></i></div>
              <div>
                <div className="metric-value">{metrics.onTimeRate}%</div>
                <div className="metric-label">On-Time Rate</div>
              </div>
            </div>
          </div>

          {/* Charts (Optional - add Chart.js later) */}
          <div className="chart-section">
            <h2>Shipments Over Time</h2>
            <div className="chart-placeholder">
              {groupedData.length === 0 ? (
                <p>No data for selected period.</p>
              ) : (
                <div className="bar-chart">
                  {groupedData.map((item, i) => (
                    <div key={i} className="bar-item">
                      <div className="bar-label">{item.label}</div>
                      <div 
                        className="bar" 
                        style={{
                          height: `${(item.count / Math.max(...groupedData.map(d => d.count))) * 100}%`,
                          backgroundColor: '#FF6B35'
                        }}
                      >
                        <span className="bar-value">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Destinations */}
          <div className="report-section">
            <h2>Top Destinations</h2>
            <div className="destinations-grid">
              {(() => {
                const destCount = {};
                shipments.forEach(s => {
                  const country = s.to?.country || 'Unknown';
                  destCount[country] = (destCount[country] || 0) + 1;
                });
                return Object.entries(destCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([country, count], i) => (
                    <div key={country} className="destination-card">
                      <div className="rank">{i + 1}</div>
                      <div className="country-info">
                        <span className="country-name">{country}</span>
                        <span className="shipments-count">{count} shipments</span>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="report-section">
            <h2>Service Usage</h2>
            <div className="service-breakdown">
              {(() => {
                const serviceCount = {};
                shipments.forEach(s => {
                  const svc = s.service || 'Unknown';
                  serviceCount[svc] = (serviceCount[svc] || 0) + 1;
                });
                const total = shipments.length;
                return Object.entries(serviceCount).map(([service, count]) => (
                  <div key={service} className="service-item">
                    <div className="service-header">
                      <span>{service}</span>
                      <span>{Math.round((count / total) * 100)}%</span>
                    </div>
                    <div className="service-bar">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${(count / total) * 100}%`,
                          backgroundColor: getServiceColor(service)
                        }}
                      ></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: Get service color
const getServiceColor = (service) => {
  const colors = {
    Express: '#FF6B35',
    Global: '#3B82F6',
    Economy: '#10B981'
  };
  return colors[service] || '#64748b';
};

export default ReportsPage;