// src/components/Dashboard/RoadTrackerFirebase.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RoadTrackerFirebase.css';

// 🔑 Firebase config — move to .env.local in production
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIza...',
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project',
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
//   appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
// };

const firebaseConfig = {
    apiKey: "AIzaSyB3x1tmnYaYmWpC88NQxdEPjIfxd632wq8",
    authDomain: "agriverseapp.firebaseapp.com",
    projectId: "agriverseapp",
    storageBucket: "agriverseapp.firebasestorage.app",
    messagingSenderId: "991130033986",
    appId: "1:991130033986:web:943d2829e35423a9feb2db"
};

//   ESM Firebase imports (no require!)
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Initialize Firebase once
let firebaseApp = null;
let firestore = null;

function getFirebase() {
  if (!firebaseApp) {
    const existingApps = getApps();
    firebaseApp = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
  }
  return firestore;
}

export default function RoadTrackerFirebase({ trackingId = 'gulu_kampala' }) {
  const [data, setData] = useState({
    exists: false,
    loading: true,
    error: null,
    doc: null,
  });
  const [connectionStatus, setConnectionStatus] = useState('offline');
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const db = getFirebase();
    const docRef = doc(db, 'simulations', trackingId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        setConnectionStatus('online');
        if (unsubscribeRef.current) {
          clearTimeout(unsubscribeRef.current);
          unsubscribeRef.current = null;
        }

        const docData = docSnap.exists() ? docSnap.data() : null;
        setData({
          exists: docSnap.exists(),
          loading: false,
          error: null,
          doc: docData,
        });

        // Debug: log first successful load
        if (docSnap.exists() && !data.exists) {
          console.log(`  Loaded tracking data for: ${trackingId}`, docData);
        }
      },
      (error) => {
        console.error(`🔥 Firestore error for ${trackingId}:`, error);
        setConnectionStatus('offline');
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Unknown error',
        }));

        // Auto-reconnect after 5s
        unsubscribeRef.current = setTimeout(() => {
          unsubscribe();
          docRef.onSnapshot(unsubscribe);
        }, 5000);
      }
    );

    return () => {
      unsubscribe();
      if (unsubscribeRef.current) {
        clearTimeout(unsubscribeRef.current);
      }
    };
  }, [trackingId, data.exists]);

  // Loading state
  if (data.loading) {
    return (
      <div className="road-tracker" style={{ padding: '20px', color: '#e2e8f0' }}>
        🌐 Loading tracking data for <code>{trackingId}</code>...
      </div>
    );
  }

  // Error / no data
  if (!data.exists || data.error) {
    return (
      <div className="road-tracker" style={{ padding: '20px', color: '#ef4444' }}>
        ⚠️ {data.error || `No tracking data found for ${trackingId}.`}
        <br />
        <small>Check Firestore: /simulations/{trackingId}</small>
      </div>
    );
  }

  //   Success — render map
  const d = data.doc;
  const routeCoords = d.route_coords_json ? JSON.parse(d.route_coords_json) : [];
  const position = d.current_position;

  // Convert [[lon, lat], ...] → [[lat, lon], ...] for Leaflet
  const routeLatLngs = routeCoords.map(([lng, lat]) => [lat, lng]);
  const start = d.start ? [d.start[1], d.start[0]] : null;
  const end = d.end ? [d.end[1], d.end[0]] : null;

  return (
    <div className="road-tracker">

      {/* Connection Status */}
      <div
        id="connection-status"
        className={`connection-status ${connectionStatus === 'online' ? 'connected' : 'disconnected'}`}
      >
        {connectionStatus === 'online' ? '  Online' : '❌ Offline'}
      </div>

      {/* Map */}
      <div className="map-containers">
        <MapContainer
          center={[1.5, 32.4]}
          zoom={8}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | SwiftParcel Tracker'
          />

          {/* Route */}
          {routeLatLngs.length > 1 && (
            <Polyline
              positions={routeLatLngs}
              color="#38bdf8"
              weight={5}
              opacity={0.95}
            />
          )}

          {/* Start Marker */}
          {start && (
            <Marker position={start}>
              <Popup>
                <b>📍 {d.start_name || 'Start'}</b>
                <br />
                Departure
              </Popup>
            </Marker>
          )}

          {/* End Marker */}
          {end && (
            <Marker position={end}>
              <Popup>
                <b>🏁 {d.end_name || 'End'}</b>
                <br />
                Destination
              </Popup>
            </Marker>
          )}

          {/* 🔴 Red Dot */}
          {position?.lat && position?.lng && (
            <CircleMarker
              center={[position.lat, position.lng]}
              radius={8}
              fillColor="#ef4444"
              color="#ffffff"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            />
          )}
        </MapContainer>
      </div>

      {/* Status Panel */}
      <div className="status-panel">
        <h3>
          <span
            className={`status-indicator status-${d.status || 'in_transit'}`}
          ></span>
          {d.start_name} → {d.end_name}
        </h3>
        <div className="status-row">
          <span className="label">Status:</span>
          <span className="value">
            {d.status === 'departed'
              ? `Departed ${d.start_name}`
              : d.status === 'in_transit'
              ? '🚚 In Transit'
              : d.status === 'arrived'
              ? `  Arrived in ${d.end_name}`
              : 'Unknown'}
          </span>
        </div>
        <div className="status-row">
          <span className="label">Progress:</span>
          <span className="value">
            {((d.progress || 0) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (d.progress || 0) * 100)}%` }}
          ></div>
        </div>
        <div className="status-row">
          <span className="label">Distance:</span>
          <span className="value">{d.distance_km || '—'} km</span>
        </div>
        <div className="status-row">
          <span className="label">Tracking ID:</span>
          <span className="value">{d.vehicle_id || trackingId}</span>
        </div>
      </div>
    </div>
  );
}