// src/components/Dashboard/PackageDetails.jsx
import React from 'react';
import './PackageDetails.css';

const PackageDetails = () => {
  return (
    <div className="package-card">
      <h3>Package Details</h3>
      <div className="total-items">41,180 <span>(Total items)</span></div>
      <div className="category-stats">
        <div className="category">
          <div className="bar" style={{ height: '67%', backgroundColor: '#FF6B35' }}></div>
          <div className="label">Electronics<br/>67%</div>
          <div className="value">20,350</div>
        </div>
        <div className="category">
          <div className="bar" style={{ height: '24%', backgroundColor: '#3B82F6' }}></div>
          <div className="label">Detergen<br/>24%</div>
          <div className="value">8,265</div>
        </div>
        <div className="category">
          <div className="bar" style={{ height: '43%', backgroundColor: '#10B981' }}></div>
          <div className="label">Fashion<br/>43%</div>
          <div className="value">12,565</div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;