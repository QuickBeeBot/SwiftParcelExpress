// src/components/Dashboard/DynamicMultiLegTracker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './DynamicMultiLegTracker.css';

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

export default function DynamicMultiLegTracker({ trackingId }) {
  const [data, setData] = useState({ loading: true, exists: false, doc: null });
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const firestore = getFirebase();
    const ref = doc(firestore, 'simulations', trackingId);
    
    const unsub = onSnapshot(ref, (snap) => {
      setData({
        loading: false,
        exists: snap.exists(),
        doc: snap.exists() ? snap.data() : null
      });
    }, (err) => {
      console.error('Firestore error:', err);
      setData({ loading: false, exists: false, doc: null });
    });

    return () => unsub();
  }, [trackingId]);

  if (data.loading) return <div className="dynamic-tracker">Loading...</div>;
  if (!data.exists) return <div className="dynamic-tracker">No data for {trackingId}</div>;

  const d = data.doc;
  const fullRoute = d.full_route_coords_json ? JSON.parse(d.full_route_coords_json) : [];
  const position = d.current_position;
  const legs = d.legs || [];

  // Color-coded segments
  const segments = [];
  let idx = 0;
  legs.forEach((leg, i) => {
    const coords = JSON.parse(leg.route_coords_json);
    const color = leg.type === 'air' ? '#06b6d4' : '#3b82f6'; // cyan for air, blue for road
    segments.push({
      coords: coords.map(([lng, lat]) => [lat, lng]),
      color,
      weight: i === 0 ? 6 : 4,
      dashArray: leg.type === 'air' ? '10,5' : undefined
    });
    idx += coords.length - (i > 0 ? 1 : 0);
  });

  // Calculate map bounds to fit all legs
  const bounds = [];
  legs.forEach(leg => {
    const coords = JSON.parse(leg.route_coords_json);
    coords.forEach(([lng, lat]) => bounds.push([lat, lng]));
  });

  return (
    <div className="dynamic-tracker">

      <div className="map-container">
        <MapContainer
          center={[0.5, 34.5]}
          zoom={6}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          whenCreated={(map) => {
            if (bounds.length > 0) {
              map.fitBounds(bounds, { padding: [60, 60] });
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          {/* Route segments */}
          {segments.map((seg, i) => (
            <Polyline
              key={i}
              positions={seg.coords}
              color={seg.color}
              weight={seg.weight}
              dashArray={seg.dashArray}
              opacity={0.9}
            />
          ))}

          {/* Waypoints */}
          {legs.map((leg, i) => (
            <Marker
              key={i}
              position={[
                leg.start_name === 'Gulu' ? 2.7746 :
                leg.start_name === 'Entebbe' ? 0.0423 :
                leg.start_name === 'Nairobi' ? -1.3192 : -4.0435,
                leg.start_name === 'Gulu' ? 32.2990 :
                leg.start_name === 'Entebbe' ? 32.4430 :
                leg.start_name === 'Nairobi' ? 36.9275 : 39.6632
              ]}
              icon={
                L.divIcon({
                  html: `<div style="background:#1e293b;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${i+1}</div>`,
                  className: ''
                })
              }
            >
              <Popup>
                <b>{leg.start_name} → {leg.end_name}</b>
                <br />
                {leg.type === 'air' ? 'Flight' : 'Road'}
              </Popup>
            </Marker>
          ))}

          {/* 🔴 Red Dot */}
          {position?.lat && position?.lng && (
            <CircleMarker
              center={[position.lat, position.lng]}
              radius={8}
              fillColor="#ef4444"
              color="#ffffff"
              weight={2}
              fillOpacity={0.9}
            />
          )}
        </MapContainer>
      </div>

      {/* Status Panel */}
      <div className="status-panel">
        <h3>{d.leg_name || 'Tracking...'}</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(d.progress || 0) * 100}%` }}></div>
        </div>
        <div className="status-row">
          <span className="label">Overall Progress:</span>
          <span className="value">{((d.progress || 0) * 100).toFixed(1)}%</span>
        </div>
        <div className="status-row">
          <span className="label">Total Distance:</span>
          <span className="value">{d.total_distance_km || '—'} km</span>
        </div>
        <div className="status-row">
          <span className="label">Status:</span>
          <span className="value" style={{ color: 
            d.status === 'delivered' ? '#10b981' : 
            d.status === 'in_transit' ? '#3b82f6' : '#f59e0b'
          }}>
            {d.status === 'delivered' ? 'Delivered' : 
             d.status === 'in_transit' ? 'In Transit' : 
             d.status === 'scheduled' ? 'Scheduled' : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}