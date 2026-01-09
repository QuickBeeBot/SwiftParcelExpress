// // src/pages/LiveTrackingPage.jsx
// import React from 'react';
import { useSearchParams } from 'react-router-dom';
import RoadTrackerFirebase from './RoadTrackerFirebase';
import AirTrackerFirebase from './AirTrackerFirebase';
import MultiLegTracker from './MultiLegTracker';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './LiveMapTrackingPage.css';

const LiveMapTrackingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [searchParams] = useSearchParams();
  const tracking = searchParams.get('tracking') || 'gulu_kampala';

  // Extract tracking ID from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('tracking');
    if (id) {
      setTrackingId(id);
    } else {
      navigate('/dashboard/tracking');
    }
  }, [location, navigate]);

  // Initialize map ONCE — robust version
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = window.L;
      if (!L) {
        console.error('❌ Leaflet not loaded. Check public/index.html');
        return;
      }

      try {
        // Create map
        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView([1.5, 32.4], 8);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        mapInstanceRef.current = map;
        console.log('  Map initialized successfully');
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    // Try immediately
    initMap();
    // Retry after 500ms (in case DOM not ready)
    const timer = setTimeout(initMap, 500);
    return () => clearTimeout(timer);
  }, []);

  // Real-time Firestore listener
  useEffect(() => {
    if (!trackingId) return;

    const docRef = doc(db, 'shipments', trackingId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        setError('Shipment not found.');
        return;
      }

      const data = docSnap.data();
      setShipment(data);

      if (data.location && mapInstanceRef.current) {
        updateMap(data.location);
      }
    }, (err) => {
      console.error('Firestore error:', err);
      setError('Failed to load shipment data.');
    });

    return () => unsubscribe();
  }, [trackingId]);

  // Update map from location data
  const updateMap = (loc) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old layers (except zoom controls)
    document.querySelectorAll('.leaflet-layer:not(.leaflet-zoom-animated)').forEach(el => {
      if (el.parentElement && el.parentElement.className.includes('leaflet-control')) return;
      el.remove();
    });

    try {
      // Route line (if available)
      if (loc.route?.length) {
        const routeLatLngs = loc.route.map(c => [c[1], c[0]]); // [lat, lon]
        L.polyline(routeLatLngs, {
          color: loc.type === 'air' ? '#3B82F6' : '#FF6B35',
          weight: 6,
          dashArray: loc.type === 'air' ? '10,5' : '',
          lineCap: 'round'
        }).addTo(map);
      }

      // Start & End markers
      if (loc.start) {
        L.marker([loc.start[1], loc.start[0]])
          .bindPopup(`<b>📍 Start</b>`).addTo(map);
      }
      if (loc.end) {
        L.marker([loc.end[1], loc.end[0]])
          .bindPopup(`<b>🏁 End</b>`).addTo(map);
      }

      // Moving marker
      if (loc.latitude && loc.longitude) {
        const iconType = loc.type === 'air' ? '✈️' : '🚚';
        const iconColor = loc.type === 'air' ? '#f97316' : '#FF6B35';
        const icon = L.divIcon({
          html: `
            <div style="
              width: 36px; height: 36px;
              transform: rotate(${loc.bearing || 0}deg);
              display: flex; align-items: center; justify-content: center;
            ">
              <span style="font-size: 24px; color: ${iconColor}; text-shadow: 0 1px 2px rgba(0,0,0,0.5)">${iconType}</span>
            </div>
          `,
          iconSize: [36, 36]
        });

        L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);

        // Auto-pan to marker
        map.panTo([loc.latitude, loc.longitude], { animate: true });
      }
    } catch (err) {
      console.warn('Map update skipped:', err);
    }
  };

  return (
    <div className="live-map-page">
      <div className="page-header">
        <h1>Live Shipment Tracking</h1>
        <p>Real-time location — updated every 2 seconds</p>
      </div>

      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {!shipment ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Connecting to shipment...</p>
        </div>
      ) : (
        <>
          <div className="status-panel">
            <h3>
              {shipment.location?.type === 'air' ? '✈️ Air Tracking' : '🚚 Road Tracking'}
            </h3>
            <div className="status-grid">
              <div><span>Tracking:</span> <strong>{trackingId}</strong></div>
              <div><span>Status:</span> <strong>{shipment.status || 'In Transit'}</strong></div>
              <div><span>Progress:</span> <strong>{shipment.location?.progress?.toFixed(1) || '0'}%</strong></div>
              <div><span>Bearing:</span> <strong>{shipment.location?.bearing?.toFixed(1) || '—'}°</strong></div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, shipment.location?.progress || 0)}%` }}
              ></div>
            </div>
          </div>

          {/*   CRITICAL: Explicit height & no ::before debug */}
          {/* <div className="map-container" ref={mapRef}></div> */}
          {/* <RoadTrackerFirebase trackingId={tracking} /> */}
          {/* <AirTrackerFirebase trackingId={tracking} /> */}
          <MultiLegTracker trackingId={tracking} />
        </>
      )}
    </div>
  );
};

export default LiveMapTrackingPage;