// src/components/Dashboard/HeaderBar.jsx
import React from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';

const HeaderBar = () => {
  const { currentUser } = useAuth();

  return (
    <div className="header-bar">
      <div className="search-icon">
        <i className="fas fa-search"></i>
      </div>
      <div className="notification-icon">
        <i className="fas fa-bell"></i>
      </div>
      <div className="user-profile">
        <img 
          src={currentUser?.photoURL || "https://via.placeholder.com/40"} 
          alt="User"
          className="avatar"
        />
        <div className="user-info">
          <div className="name">{currentUser?.displayName || 'User'}</div>
          <div className="role">Manager</div>
        </div>
        <i className="fas fa-chevron-down"></i>
      </div>
    </div>
  );
};

export default HeaderBar;