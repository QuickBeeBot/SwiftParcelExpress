// src/components/Dashboard/AirTrackerFirebase.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './AirTrackerFirebase.css';

// Firebase ESM (no require!)
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIza...',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app = null;
let db = null;
function getFirebase() {
  if (!app) {
    const apps = getApps();
    app = apps.length ? apps[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return db;
}

export default function AirTrackerFirebase({ trackingId = 'flight_EBB_NBO' }) {
  const [data, setData] = useState({ exists: false, loading: true, error: null, doc: null });
  const [connectionStatus, setConnectionStatus] = useState('offline');
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const firestore = getFirebase();
    const docRef = doc(firestore, 'simulations', trackingId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        setConnectionStatus('online');
        if (unsubscribeRef.current) clearTimeout(unsubscribeRef.current);
        setData({
          exists: docSnap.exists(),
          loading: false,
          error: null,
          doc: docSnap.exists() ? docSnap.data() : null,
        });
      },
      (error) => {
        console.error('Firestore error:', error);
        setConnectionStatus('offline');
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        unsubscribeRef.current = setTimeout(() => {
          unsubscribe();
          docRef.onSnapshot(unsubscribe);
        }, 5000);
      }
    );

    return () => {
      unsubscribe();
      if (unsubscribeRef.current) clearTimeout(unsubscribeRef.current);
    };
  }, [trackingId]);

  if (data.loading) return <div className="air-tracker"><div className="loading">✈️ Loading flight...</div></div>;
  if (!data.exists || data.error) {
    return (
      <div className="air-tracker">
        <div className="error">
          ⚠️ {data.error || `Flight ${trackingId} not found.`}
        </div>
      </div>
    );
  }

  const d = data.doc;
  const routeCoords = d.route_coords_json ? JSON.parse(d.route_coords_json) : [];
  const pos = d.current_position;
  const routeLatLngs = routeCoords.map(([lng, lat]) => [lat, lng]);
  const start = d.start ? [d.start[1], d.start[0]] : null;
  const end = d.end ? [d.end[1], d.end[0]] : null;

  return (
    <div className="air-tracker">

      <div
        className={`connection-status ${connectionStatus === 'online' ? 'connected' : 'disconnected'}`}
      >
        {connectionStatus === 'online' ? '  Online' : '❌ Offline'}
      </div>

      <div className="map-container">
        <MapContainer
          center={[1.5, 34.0]}
          zoom={7}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap | SwiftParcel Air'
          />

          {routeLatLngs.length > 1 && (
            <Polyline
              positions={routeLatLngs}
              color="#0ea5e9"
              weight={4}
              opacity={0.85}
              dashArray="8,4"
            />
          )}

          {start && (
            <Marker position={start}>
              <Popup><b>🛫 {d.origin_name} ({d.origin})</b></Popup>
            </Marker>
          )}
          {end && (
            <Marker position={end}>
              <Popup><b>🛬 {d.dest_name} ({d.dest})</b></Popup>
            </Marker>
          )}

          {/* 🔴 RED DOT (per your request) */}
          {pos?.lat && pos?.lng && (
            <CircleMarker
              center={[pos.lat, pos.lng]}
              radius={6}
              fillColor="#ef4444"
              color="#ffffff"
              weight={2}
              opacity={1}
              fillOpacity={0.9}
            />
          )}
        </MapContainer>
      </div>

      <div className="status-panel">
        <h3>
          <span className={`status-indicator status-${d.status || 'in_transit'}`}></span>
          {d.origin} ({d.city_from}) → {d.dest} ({d.city_to})
        </h3>
        <div className="status-row">
          <span className="label">Status:</span>
          <span className="value">
            {d.status === 'departed'
              ? `Departed ${d.city_from}`
              : d.status === 'in_transit'
              ? '✈️ In Flight'
              : d.status === 'arrived'
              ? `  Landed in ${d.city_to}`
              : 'Unknown'}
          </span>
        </div>
        <div className="status-row">
          <span className="label">Progress:</span>
          <span className="value">{((d.progress || 0) * 100).toFixed(1)}%</span>
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
          <span className="label">Flight ID:</span>
          <span className="value">{d.vehicle_id || trackingId}</span>
        </div>
        {d.carriers?.length > 0 && (
          <div className="status-row">
            <span className="label">Carrier(s):</span>
            <span className="value">{d.carriers.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}