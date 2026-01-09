// src/components/Dashboard/ShipmentList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ShipmentList.css';

const ShipmentList = ({ shipments = [] }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered': return 'delivered';
      case 'in_transit': return 'in_transit';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'pending': return 'Pending';
      default: return 'Processing';
    }
  };

  return (
    <div className="shipment-list">
      {shipments.length === 0 ? (
        <p className="no-shipments">No shipments found.</p>
      ) : (
        shipments.map((shipment) => (
          <div 
            key={shipment.id} 
            className="shipment-item"
            onClick={() => navigate(`/dashboard/tracking?tracking=${shipment.tracking}`)}
          >
            <div className="shipment-info">
              <h4>#{shipment.id}</h4>
              <p>{shipment.from} → {shipment.to}</p>
              <p className="service">{shipment.service} • {shipment.date}</p>
            </div>
            <div className="shipment-actions">
              <span className={`shipment-status ${getStatusClass(shipment.status)}`}>
                {getStatusText(shipment.status)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ShipmentList;