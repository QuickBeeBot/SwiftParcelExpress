// src/components/Admin/StatCard.jsx
import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color = '#FF6B35' }) => {
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="card-icon">
        <i className={icon}></i>
      </div>
      <div className="card-content">
        <div className="card-value">{value}</div>
        <div className="card-title">{title}</div>
      </div>
    </div>
  );
};

export default StatCard;