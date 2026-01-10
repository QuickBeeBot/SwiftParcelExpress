// src/pages/PublicTrackingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './PublicTrackingPage.css';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import DynamicMultiLegTracker from '../components/Dashboard/DynamicMultiLegTracker';

const PublicTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();
  const trackingParam = searchParams.get('tracking') || '';

  // Auto-fill from URL ?tracking=...
  useEffect(() => {
    const id = trackingParam;
    if (id) {
      setTrackingId(id);
      handleTrack(id);
    }
  }, [trackingParam]);

  const handleTrack = async (id) => {
    if (!id?.trim()) {
      setError('Please enter a tracking number.');
      return;
    }

    setLoading(true);
    setError('');
    setShipment(null);

    try {
      // ✅ Query 'shipments' collection by trackingNumber
      const q = query(
        collection(db, 'shipments'),
        where('trackingNumber', '==', id.trim().toUpperCase())
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError('Tracking number not found.');
        return;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      const normalized = {
        id: doc.id,
        trackingNumber: data.trackingNumber,
        status: data.status,
        client: data.client || {},
        packages: data.packages || [],
        route: data.route || {},
        quote: data.quote,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        events: data.events || []
      };

      setShipment(normalized);
    } catch (err) {
      console.error('Tracking failed:', err);
      setError('Failed to retrieve tracking data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const currentLeg = useMemo(() => {
    if (!shipment) return null;

    const now = new Date();
    const route = shipment.route;

    const pickupScheduled = route.pickup?.scheduledTime 
      ? new Date(route.pickup.scheduledTime) 
      : null;
    if (pickupScheduled && now >= pickupScheduled) {
      return { type: 'pickup', leg: route.pickup };
    }

    for (let i = route.airLegs?.length - 1; i >= 0; i--) {
      const leg = route.airLegs[i];
      const departure = leg.departureTimeScheduled 
        ? new Date(leg.departureTimeScheduled) 
        : null;
      const arrival = leg.arrivalTimeScheduled 
        ? new Date(leg.arrivalTimeScheduled) 
        : null;

      if (departure && now >= departure) {
        if (arrival && now >= arrival) {
          continue;
        }
        return { type: 'air', leg, index: i + 1 };
      }
    }

    const deliveryScheduled = route.delivery?.scheduledTime 
      ? new Date(route.delivery.scheduledTime) 
      : null;
    if (deliveryScheduled && now >= deliveryScheduled) {
      return { type: 'delivery', leg: route.delivery };
    }

    return { type: 'pickup', leg: route.pickup };
  }, [shipment]);

  const timelineEvents = useMemo(() => {
    if (!shipment) return [];

    const events = [];

    const pickup = shipment.route.pickup;
    if (pickup?.scheduledTime) {
      const time = new Date(pickup.scheduledTime);
      events.push({
        id: 'pickup',
        time,
        location: `${pickup.location} (${pickup.facility})`,
        status: 'Package picked up',
        type: 'pickup',
        completed: new Date() >= time
      });
    }

    shipment.route.airLegs?.forEach((leg, i) => {
      const depTime = leg.departureTimeScheduled 
        ? new Date(leg.departureTimeScheduled) 
        : null;
      const arrTime = leg.arrivalTimeScheduled 
        ? new Date(leg.arrivalTimeScheduled) 
        : null;

      if (depTime) {
        events.push({
          id: `dep-${i}`,
          time: depTime,
          location: `${leg.departureAirport} (${leg.flightNumber})`,
          status: `Departed from ${leg.departureAirport}`,
          type: 'air',
          completed: new Date() >= depTime
        });
      }
      if (arrTime) {
        events.push({
          id: `arr-${i}`,
          time: arrTime,
          location: `${leg.arrivalAirport} (${leg.flightNumber})`,
          status: `Arrived at ${leg.arrivalAirport}`,
          type: 'air',
          completed: new Date() >= arrTime
        });
      }
    });

    const delivery = shipment.route.delivery;
    if (delivery?.scheduledTime) {
      const time = new Date(delivery.scheduledTime);
      events.push({
        id: 'delivery',
        time,
        location: `${delivery.location} (${delivery.facility})`,
        status: 'Delivered to recipient',
        type: 'delivery',
        completed: new Date() >= time
      });
    }

    return events.sort((a, b) => a.time - b.time);
  }, [shipment]);

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'pickup': return 'fas fa-box';
      case 'air': return 'fas fa-plane';
      case 'delivery': return 'fas fa-truck';
      default: return 'fas fa-box';
    }
  };

  const getStatusText = (shipment) => {
    if (!shipment) return '—';
    
    const statusMap = {
      pending_review: 'Pending Review',
      quote_ready: 'Quote Ready',
      paid: 'Payment Confirmed',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      canceled: 'Canceled'
    };
    return statusMap[shipment.status] || 'Processing';
  };

  const getStatusClass = (shipment) => {
    const classMap = {
      delivered: 'success',
      in_transit: 'info',
      paid: 'success',
      quote_ready: 'warning',
      pending_review: 'warning',
      canceled: 'danger'
    };
    return classMap[shipment.status] || 'warning';
  };

  return (
    <>
      <Helmet>
        <title>Track Shipment - SwiftParcel</title>
        <meta name="description" content="Track your SwiftParcel shipment in real-time. Enter your tracking ID to get the latest status updates." />
      </Helmet>

      <Navigation />

      <div className="public-tracking-page">
        <div className="tracking-header">
          <h1>Track Your Shipment</h1>
          <p>Real-time updates from pickup to delivery</p>
        </div>

        {!shipment ? (
          <div className="tracking-form">
            <form onSubmit={(e) => { e.preventDefault(); handleTrack(trackingId); }}>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking number (e.g., SP2025XYZ)"
                required
              />
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Tracking...
                  </>
                ) : (
                  'Track Now'
                )}
              </button>
            </form>
            {error && (
              <div className="alert error">
                ❌ {error}
              </div>
            )}
            <p className="example">Example: <code>SP2025XYZ</code></p>
          </div>
        ) : (
          <div className="tracking-result">
            {/* Shipment Summary */}
            <div className="shipment-summary">
              <div className="summary-header">
                <h2>{shipment.trackingNumber}</h2>
                <div className="status-badge-wrapper">
                  <span className={`status-badge ${getStatusClass(shipment)}`}>
                    {getStatusText(shipment)}
                  </span>
                </div>
              </div>
              
              <div className="route-overview">
                <div className="route-leg">
                  <div className="leg-icon"><i className="fas fa-truck"></i></div>
                  <div className="leg-info">
                    <div className="leg-location">{shipment.route?.pickup?.location || '—'}</div>
                    <div className="leg-time">{formatDate(shipment.route?.pickup?.scheduledTime)}</div>
                  </div>
                </div>
                
                {shipment.route?.airLegs?.map((leg, i) => (
                  <div key={i} className="route-leg">
                    <div className="leg-icon"><i className="fas fa-plane"></i></div>
                    <div className="leg-info">
                      <div className="leg-location">{leg.departureAirport} → {leg.arrivalAirport}</div>
                      <div className="leg-time">
                        {formatDate(leg.departureTimeScheduled)} → {formatDate(leg.arrivalTimeScheduled)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="route-leg">
                  <div className="leg-icon"><i className="fas fa-truck"></i></div>
                  <div className="leg-info">
                    <div className="leg-location">{shipment.route?.delivery?.location || '—'}</div>
                    <div className="leg-time">{formatDate(shipment.route?.delivery?.scheduledTime)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="current-status">
              <h3>Current Status</h3>
              {currentLeg ? (
                <div className="status-card">
                  <div className="status-icon">
                    <i className={getStatusIcon(currentLeg.type)}></i>
                  </div>
                  <div className="status-content">
                    <div className="status-title">
                      {currentLeg.type === 'pickup' && (
                        <>
                          <i className="fas fa-box me-2"></i> Package Pickup
                        </>
                      )}
                      {currentLeg.type === 'air' && (
                        <>
                          <i className="fas fa-plane-departure me-2"></i> Flight {currentLeg.index}
                        </>
                      )}
                      {currentLeg.type === 'delivery' && (
                        <>
                          <i className="fas fa-truck-fast me-2"></i> Final Delivery
                        </>
                      )}
                    </div>
                    <div className="status-location">
                      {currentLeg.leg?.location || currentLeg.leg?.departureAirport || '—'}
                    </div>
                    <div className="status-time">
                      Scheduled: {formatDate(currentLeg.leg?.scheduledTime || currentLeg.leg?.departureTimeScheduled)}
                    </div>
                  </div>
                </div>
              ) : (
                <p>No active leg found.</p>
              )}
            </div>

            {/* Timeline */}
            <div className="timeline-section">
              <h3>Shipment Timeline</h3>
              <div className="timeline">
                {timelineEvents.length === 0 ? (
                  <p className="no-events">No timeline events available.</p>
                ) : (
                  timelineEvents.map((event) => (
                    <div key={event.id} className="timeline-item">
                      <div className={`timeline-dot ${event.completed ? 'completed' : ''}`}>
                        <i className={getStatusIcon(event.type)}></i>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-time">{formatDate(event.time)}</div>
                        <div className="timeline-location">{event.location}</div>
                        <div className="timeline-status">{event.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Map Preview */}
            <div className="map-section">
              <h3>Live Location</h3>
              <div className="map-container">
                {/* Pass the actual tracking number, not the param variable */}
                <DynamicMultiLegTracker trackingId={shipment.trackingNumber} />
              </div>
              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-dot current"></div>
                  <span>Current Location</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot delivery"></div>
                  <span>Road Transport</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot air"></div>
                  <span>Air Transport</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot pickup"></div>
                  <span>Pickup Point</span>
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="details-section">
              <h3>Shipment Details</h3>
              <div className="details-grid">
                <div className="detail-card">
                  <h4><i className="fas fa-user"></i> Client</h4>
                  <p><strong>Name:</strong> {shipment.client?.name || '—'}</p>
                  <p><strong>Email:</strong> {shipment.client?.email || '—'}</p>
                  <p><strong>Phone:</strong> {shipment.client?.phone || '—'}</p>
                </div>
                
                <div className="detail-card">
                  <h4><i className="fas fa-boxes"></i> Packages</h4>
                  {shipment.packages?.length ? (
                    shipment.packages.map((pkg, i) => (
                      <div key={pkg.id || i} className="package-item">
                        <div><strong>#{i + 1}:</strong> {pkg.description}</div>
                        <div><strong>Weight:</strong> {pkg.weight} kg</div>
                        <div><strong>Dimensions:</strong> {pkg.length} × {pkg.width} × {pkg.height} cm</div>
                      </div>
                    ))
                  ) : (
                    <p>No packages listed.</p>
                  )}
                </div>
                
                <div className="detail-card">
                  <h4><i className="fas fa-info-circle"></i> Service</h4>
                  <p><strong>Type:</strong> {shipment.route?.serviceType || 'Standard'}</p>
                  <p><strong>Priority:</strong> {shipment.route?.priority || 'Medium'}</p>
                  <p><strong>Insurance:</strong> {shipment.route?.insurance ? 'Yes' : 'No'}</p>
                  {shipment.quote && (
                    <div className="quote-summary">
                      <p><strong>Total:</strong> ${shipment.quote.total?.toFixed(2) || '—'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="tracking-actions">
              <button className="btn-secondary">
                <i className="fas fa-print me-1"></i> Print Label
              </button>
              <button className="btn-secondary">
                <i className="fas fa-envelope me-1"></i> Email Updates
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleTrack(trackingId)}
              >
                <i className="fas fa-sync-alt me-1"></i> Refresh Status
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default PublicTrackingPage;

// // src/pages/PublicTrackingPage.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { db } from '../lib/firebase';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import './PublicTrackingPage.css';
// import { useSearchParams } from 'react-router-dom';
// import Navigation from '../components/Navigation';
// import Footer from '../components/Footer';
// import DynamicMultiLegTracker from '../components/Dashboard/DynamicMultiLegTracker';

// const PublicTrackingPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [trackingId, setTrackingId] = useState('');
//   const [shipment, setShipment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const [searchParams] = useSearchParams();
//   const tracking = searchParams.get('tracking') || '';

//   // Auto-fill from URL ?tracking=...
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const id = params.get('tracking');
//     if (id) {
//       setTrackingId(id);
//       handleTrack(id);
//     }
//   }, [location]);

//   const handleTrack = async (id) => {
//     if (!id?.trim()) {
//       setError('Please enter a tracking number.');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setShipment(null);

//     try {
//       const q = query(
//         collection(db, 'shipments'),
//         where('trackingNumber', '==', id.trim().toUpperCase())
//       );

//       const querySnapshot = await getDocs(q);
//       if (querySnapshot.empty) {
//         setError('Tracking number not found.');
//         return;
//       }

//       const doc = querySnapshot.docs[0];
//       const data = doc.data();

//       const normalized = {
//         id: doc.id,
//         trackingNumber: data.trackingNumber,
//         status: data.status,
//         client: data.client || {},
//         packages: data.packages || [],
//         route: data.route || {},
//         quote: data.quote,
//         userId: data.userId,
//         createdAt: data.createdAt?.toDate() || new Date(),
//         updatedAt: data.updatedAt?.toDate() || new Date(),
//         events: data.events || []
//       };

//       setShipment(normalized);
//     } catch (err) {
//       console.error('Tracking failed:', err);
//       setError('Failed to retrieve tracking data.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const currentLeg = useMemo(() => {
//     if (!shipment) return null;

//     const now = new Date();
//     const route = shipment.route;

//     const pickupScheduled = route.pickup?.scheduledTime 
//       ? new Date(route.pickup.scheduledTime) 
//       : null;
//     if (pickupScheduled && now >= pickupScheduled) {
//       return { type: 'pickup', leg: route.pickup };
//     }

//     for (let i = route.airLegs?.length - 1; i >= 0; i--) {
//       const leg = route.airLegs[i];
//       const departure = leg.departureTimeScheduled 
//         ? new Date(leg.departureTimeScheduled) 
//         : null;
//       const arrival = leg.arrivalTimeScheduled 
//         ? new Date(leg.arrivalTimeScheduled) 
//         : null;

//       if (departure && now >= departure) {
//         if (arrival && now >= arrival) {
//           continue;
//         }
//         return { type: 'air', leg, index: i + 1 };
//       }
//     }

//     const deliveryScheduled = route.delivery?.scheduledTime 
//       ? new Date(route.delivery.scheduledTime) 
//       : null;
//     if (deliveryScheduled && now >= deliveryScheduled) {
//       return { type: 'delivery', leg: route.delivery };
//     }

//     return { type: 'pickup', leg: route.pickup };
//   }, [shipment]);

//   const timelineEvents = useMemo(() => {
//     if (!shipment) return [];

//     const events = [];

//     const pickup = shipment.route.pickup;
//     if (pickup?.scheduledTime) {
//       const time = new Date(pickup.scheduledTime);
//       events.push({
//         id: 'pickup',
//         time,
//         location: `${pickup.location} (${pickup.facility})`,
//         status: 'Package picked up',
//         type: 'pickup',
//         completed: new Date() >= time
//       });
//     }

//     shipment.route.airLegs?.forEach((leg, i) => {
//       const depTime = leg.departureTimeScheduled 
//         ? new Date(leg.departureTimeScheduled) 
//         : null;
//       const arrTime = leg.arrivalTimeScheduled 
//         ? new Date(leg.arrivalTimeScheduled) 
//         : null;

//       if (depTime) {
//         events.push({
//           id: `dep-${i}`,
//           time: depTime,
//           location: `${leg.departureAirport} (${leg.flightNumber})`,
//           status: `Departed from ${leg.departureAirport}`,
//           type: 'air',
//           completed: new Date() >= depTime
//         });
//       }
//       if (arrTime) {
//         events.push({
//           id: `arr-${i}`,
//           time: arrTime,
//           location: `${leg.arrivalAirport} (${leg.flightNumber})`,
//           status: `Arrived at ${leg.arrivalAirport}`,
//           type: 'air',
//           completed: new Date() >= arrTime
//         });
//       }
//     });

//     const delivery = shipment.route.delivery;
//     if (delivery?.scheduledTime) {
//       const time = new Date(delivery.scheduledTime);
//       events.push({
//         id: 'delivery',
//         time,
//         location: `${delivery.location} (${delivery.facility})`,
//         status: 'Delivered to recipient',
//         type: 'delivery',
//         completed: new Date() >= time
//       });
//     }

//     return events.sort((a, b) => a.time - b.time);
//   }, [shipment]);

//   const formatDate = (date) => {
//     if (!date) return '—';
//     return new Date(date).toLocaleString(undefined, {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusIcon = (type) => {
//     switch (type) {
//       case 'pickup': return 'fas fa-box';
//       case 'air': return 'fas fa-plane';
//       case 'delivery': return 'fas fa-truck';
//       default: return 'fas fa-box';
//     }
//   };

//   const getStatusText = (shipment) => {
//     if (!shipment) return '—';
    
//     const statusMap = {
//       pending_review: 'Pending Review',
//       quote_ready: 'Quote Ready',
//       paid: 'Payment Confirmed',
//       in_transit: 'In Transit',
//       out_for_delivery: 'Out for Delivery',
//       delivered: 'Delivered',
//       canceled: 'Canceled'
//     };
//     return statusMap[shipment.status] || 'Processing';
//   };

//   const getStatusClass = (shipment) => {
//     const classMap = {
//       delivered: 'success',
//       in_transit: 'info',
//       paid: 'success',
//       quote_ready: 'warning',
//       pending_review: 'warning',
//       canceled: 'danger'
//     };
//     return classMap[shipment.status] || 'warning';
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Track Shipment - SwiftParcel</title>
//         <meta name="description" content="Track your SwiftParcel shipment in real-time. Enter your tracking ID to get the latest status updates." />
//       </Helmet>

//       {/* Navigation */}
//       <Navigation />

//       {/* Main Content */}
//       <div className="public-tracking-page">
//         <div className="tracking-header">
//           <h1>Track Your Shipment</h1>
//           <p>Real-time updates from pickup to delivery</p>
//         </div>

//         {!shipment ? (
//           <div className="tracking-form">
//             <form onSubmit={(e) => { e.preventDefault(); handleTrack(trackingId); }}>
//               <input
//                 type="text"
//                 value={trackingId}
//                 onChange={(e) => setTrackingId(e.target.value)}
//                 placeholder="Enter tracking number (e.g., SP2025XYZ)"
//                 required
//               />
//               <button 
//                 type="submit" 
//                 className="btn-primary"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner"></span>
//                     Tracking...
//                   </>
//                 ) : (
//                   'Track Now'
//                 )}
//               </button>
//             </form>
//             {error && (
//               <div className="alert error">
//                 ❌ {error}
//               </div>
//             )}
//             <p className="example">Example: <code>SP2025XYZ</code></p>
//           </div>
//         ) : (
//           <div className="tracking-result">
//             {/* Shipment Summary */}
//             <div className="shipment-summary">
//               <div className="summary-header">
//                 <h2>{shipment.trackingNumber}</h2>
//                 <div className="status-badge-wrapper">
//                   <span className={`status-badge ${getStatusClass(shipment)}`}>
//                     {getStatusText(shipment)}
//                   </span>
//                 </div>
//               </div>
              
//               <div className="route-overview">
//                 <div className="route-leg">
//                   <div className="leg-icon"><i className="fas fa-truck"></i></div>
//                   <div className="leg-info">
//                     <div className="leg-location">{shipment.route?.pickup?.location || '—'}</div>
//                     <div className="leg-time">{formatDate(shipment.route?.pickup?.scheduledTime)}</div>
//                   </div>
//                 </div>
                
//                 {shipment.route?.airLegs?.map((leg, i) => (
//                   <div key={i} className="route-leg">
//                     <div className="leg-icon"><i className="fas fa-plane"></i></div>
//                     <div className="leg-info">
//                       <div className="leg-location">{leg.departureAirport} → {leg.arrivalAirport}</div>
//                       <div className="leg-time">
//                         {formatDate(leg.departureTimeScheduled)} → {formatDate(leg.arrivalTimeScheduled)}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
                
//                 <div className="route-leg">
//                   <div className="leg-icon"><i className="fas fa-truck"></i></div>
//                   <div className="leg-info">
//                     <div className="leg-location">{shipment.route?.delivery?.location || '—'}</div>
//                     <div className="leg-time">{formatDate(shipment.route?.delivery?.scheduledTime)}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Current Status */}
//             <div className="current-status">
//               <h3>Current Status</h3>
//               {currentLeg ? (
//                 <div className="status-card">
//                   <div className="status-icon">
//                     <i className={getStatusIcon(currentLeg.type)}></i>
//                   </div>
//                   <div className="status-content">
//                     <div className="status-title">
//                       {currentLeg.type === 'pickup' && (
//                         <>
//                           <i className="fas fa-box me-2"></i> Package Pickup
//                         </>
//                       )}
//                       {currentLeg.type === 'air' && (
//                         <>
//                           <i className="fas fa-plane-departure me-2"></i> Flight {currentLeg.index}
//                         </>
//                       )}
//                       {currentLeg.type === 'delivery' && (
//                         <>
//                           <i className="fas fa-truck-fast me-2"></i> Final Delivery
//                         </>
//                       )}
//                     </div>
//                     <div className="status-location">
//                       {currentLeg.leg?.location || currentLeg.leg?.departureAirport || '—'}
//                     </div>
//                     <div className="status-time">
//                       Scheduled: {formatDate(currentLeg.leg?.scheduledTime || currentLeg.leg?.departureTimeScheduled)}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <p>No active leg found.</p>
//               )}
//             </div>

//             {/* Timeline */}
//             <div className="timeline-section">
//               <h3>Shipment Timeline</h3>
//               <div className="timeline">
//                 {timelineEvents.length === 0 ? (
//                   <p className="no-events">No timeline events available.</p>
//                 ) : (
//                   timelineEvents.map((event) => (
//                     <div key={event.id} className="timeline-item">
//                       <div className={`timeline-dot ${event.completed ? 'completed' : ''}`}>
//                         <i className={getStatusIcon(event.type)}></i>
//                       </div>
//                       <div className="timeline-content">
//                         <div className="timeline-time">{formatDate(event.time)}</div>
//                         <div className="timeline-location">{event.location}</div>
//                         <div className="timeline-status">{event.status}</div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Map Preview */}
//             <div className="map-section">
//               <h3>Live Location</h3>
//               <div className="map-container">
//                 <DynamicMultiLegTracker trackingId={tracking} />
//               </div>
//               <div className="map-legend">
//                 <div className="legend-item">
//                   <div className="legend-dot current"></div>
//                   <span>Current Location</span>
//                 </div>
//                 <div className="legend-item">
//                   <div className="legend-dot delivery"></div>
//                   <span>Road Transport</span>
//                 </div>
//                 <div className="legend-item">
//                   <div className="legend-dot air"></div>
//                   <span>Air Transport</span>
//                 </div>
//                 <div className="legend-item">
//                   <div className="legend-dot pickup"></div>
//                   <span>Pickup Point</span>
//                 </div>
//               </div>
//             </div>

//             {/* Shipment Details */}
//             <div className="details-section">
//               <h3>Shipment Details</h3>
//               <div className="details-grid">
//                 <div className="detail-card">
//                   <h4><i className="fas fa-user"></i> Client</h4>
//                   <p><strong>Name:</strong> {shipment.client?.name || '—'}</p>
//                   <p><strong>Email:</strong> {shipment.client?.email || '—'}</p>
//                   <p><strong>Phone:</strong> {shipment.client?.phone || '—'}</p>
//                 </div>
                
//                 <div className="detail-card">
//                   <h4><i className="fas fa-boxes"></i> Packages</h4>
//                   {shipment.packages?.length ? (
//                     shipment.packages.map((pkg, i) => (
//                       <div key={pkg.id || i} className="package-item">
//                         <div><strong>#{i + 1}:</strong> {pkg.description}</div>
//                         <div><strong>Weight:</strong> {pkg.weight} kg</div>
//                         <div><strong>Dimensions:</strong> {pkg.length} × {pkg.width} × {pkg.height} cm</div>
//                       </div>
//                     ))
//                   ) : (
//                     <p>No packages listed.</p>
//                   )}
//                 </div>
                
//                 <div className="detail-card">
//                   <h4><i className="fas fa-info-circle"></i> Service</h4>
//                   <p><strong>Type:</strong> {shipment.route?.serviceType || 'Standard'}</p>
//                   <p><strong>Priority:</strong> {shipment.route?.priority || 'Medium'}</p>
//                   <p><strong>Insurance:</strong> {shipment.route?.insurance ? 'Yes' : 'No'}</p>
//                   {shipment.quote && (
//                     <div className="quote-summary">
//                       <p><strong>Total:</strong> ${shipment.quote.total?.toFixed(2) || '—'}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="tracking-actions">
//               <button className="btn-secondary">
//                 <i className="fas fa-print me-1"></i> Print Label
//               </button>
//               <button className="btn-secondary">
//                 <i className="fas fa-envelope me-1"></i> Email Updates
//               </button>
//               <button 
//                 className="btn-primary"
//                 onClick={() => handleTrack(trackingId)}
//               >
//                 <i className="fas fa-sync-alt me-1"></i> Refresh Status
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <Footer />
//     </>
//   );
// };

// export default PublicTrackingPage;




