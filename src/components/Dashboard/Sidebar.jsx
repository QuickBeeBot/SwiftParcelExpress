// src/components/Dashboard/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">Swift<span>Parcel</span></div>
      <div className="menu-section">
        <h4>MAIN MENU</h4>
        <ul>
          <li><Link to="/dashboard" className="active"><i className="fas fa-home"></i> Overview</Link></li>
          <li><Link to="/dashboard/shipments"><i className="fas fa-boxes"></i> Shipments</Link></li>
          <li><Link to="/dashboard/orders"><i className="fas fa-cube"></i> Orders</Link></li>
          <li><Link to="/dashboard/messages"><i className="fas fa-comment"></i> Messages <span className="badge">6</span></Link></li>
          <li><Link to="/dashboard/activity"><i className="fas fa-chart-line"></i> Activity</Link></li>
        </ul>
      </div>
      <div className="menu-section">
        <h4>GENERAL</h4>
        <ul>
          <li><Link to="/dashboard/report"><i className="fas fa-file-alt"></i> Report</Link></li>
          <li><Link to="/dashboard/support"><i className="fas fa-question-circle"></i> Support</Link></li>
          <li><Link to="/dashboard/account"><i className="fas fa-user"></i> Account</Link></li>
        </ul>
      </div>
      <div className="menu-section">
        <h4>OTHERS</h4>
        <ul>
          <li><Link to="/dashboard/settings"><i className="fas fa-cog"></i> Settings</Link></li>
          <li><Link to="/logout"><i className="fas fa-sign-out-alt"></i> Log Out</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;