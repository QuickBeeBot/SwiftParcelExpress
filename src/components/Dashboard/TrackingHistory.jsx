// src/components/Dashboard/TrackingHistory.jsx
import React from 'react';
import './TrackingHistory.css';

const TrackingHistory = () => {
  return (
    <div className="tracking-card">
      <h3>Tracking History</h3>
      <div className="tracking-info">
        <div className="tracking-id">
          <strong>Tracking ID:</strong> #12939-123-133ob
          <span className="status-badge in-transit">In transit</span>
        </div>
        <div className="location-info">
          <div className="location-item">
            <div className="dot"></div>
            <div>
              <strong>Current Location:</strong> Los Angeles Gateway
            </div>
          </div>
          <div className="location-item">
            <div className="dot"></div>
            <div>
              <strong>Departure Waypoint:</strong> Las Vegas, NV - USA
            </div>
          </div>
          <div className="location-item">
            <div className="dot"></div>
            <div>
              <strong>Arrival Waypoint:</strong> San Diego, USA
            </div>
          </div>
        </div>
      </div>
      <div className="map-preview">
        <img src="https://via.placeholder.com/600x300?text=Map+Preview" alt="Route Map" />
        <div className="distance-info">
          <strong>Distance to arrival:</strong> 50 km • 1h 20m
        </div>
      </div>
    </div>
  );
};

export default TrackingHistory;