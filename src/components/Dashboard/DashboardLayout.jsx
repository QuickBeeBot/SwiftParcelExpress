// src/components/Dashboard/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { currentUser, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Close sidebar & dropdown on route change
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
      setShowProfileDropdown(false);
    }
  }, [location.pathname]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151515] text-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#36FFDB] border-t-transparent" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151515] text-white">
        <p>You must be signed in to access the dashboard.</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error('Sign out failed:', e);
      alert('Failed to sign out. Please try again.');
    }
  };

  const isActive = (path) => location.pathname === path;

  const displayName =
    currentUser.displayName ||
    currentUser.email?.split('@')[0] ||
    'User';

  const userEmail = currentUser.email || 'N/A';

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Hamburger Menu */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-[#1F1F1F] text-[#36FFDB] shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src="/images/logo.png"
            alt="SwiftParcel Logo"
            className="logo h-3 w-auto mx-auto"
          />
          
          <div className="user-info-card">
            <div className="user-avatar">
              {currentUser.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h3 className="user-name">{displayName}</h3>
              <p className="user-email">{userEmail}</p>
              <span className="user-status">Active</span>
            </div>
          </div>
        </div>

        <div className="sidebar-nav-wrapper">
          <nav className="sidebar-nav">
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              <i className="fas fa-home"></i> Overview
            </Link>
            <Link to="/dashboard/shipments" className={isActive('/dashboard/shipments') ? 'active' : ''}>
              <i className="fas fa-boxes"></i> Shipments
            </Link>
            <Link to="/dashboard/new-shipment" className={isActive('/dashboard/new-shipment') ? 'active' : ''}>
              <i className="fas fa-plus-circle"></i> New Shipment
            </Link>
            <Link to="/dashboard/tracking" className={isActive('/dashboard/tracking') ? 'active' : ''}>
              <i className="fas fa-map-marked-alt"></i> Track
            </Link>
            <Link to="/dashboard/orders" className={isActive('/dashboard/orders') ? 'active' : ''}>
              <i className="fas fa-cube"></i> Orders
            </Link>
            <Link to="/dashboard/messages" className={isActive('/dashboard/messages') ? 'active' : ''}>
              <i className="fas fa-comment"></i> Messages
            </Link>
            <Link to="/dashboard/activity" className={isActive('/dashboard/activity') ? 'active' : ''}>
              <i className="fas fa-chart-line"></i> Activity
            </Link>
            <Link to="/dashboard/report" className={isActive('/dashboard/report') ? 'active' : ''}>
              <i className="fas fa-file-alt"></i> Report
            </Link>
            <Link to="/dashboard/support" className={isActive('/dashboard/support') ? 'active' : ''}>
              <i className="fas fa-question-circle"></i> Support
            </Link>
            <Link to="/dashboard/account" className={isActive('/dashboard/account') ? 'active' : ''}>
              <i className="fas fa-user"></i> Account
            </Link>
            <Link to="/dashboard/settings" className={isActive('/dashboard/settings') ? 'active' : ''}>
              <i className="fas fa-cog"></i> Settings
            </Link>
            <Link to="/dashboard/billing" className={isActive('/dashboard/billing') ? 'active' : ''}>
              <i className="fas fa-credit-card"></i> Billing
            </Link>
            <Link to="/dashboard/documents" className={isActive('/dashboard/documents') ? 'active' : ''}>
              <i className="fas fa-file-invoice"></i> Documents
            </Link>
          </nav>
        </div>

        <button className="btn-logout" onClick={handleSignOut}>
          <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`dashboard-mains ${sidebarOpen && window.innerWidth < 768 ? 'blurred' : ''}`}>
        {/* Top Header Bar */}
        <header className="dashboard-header">
          <div className="header-left">
            <p className="welcome-text">Welcome back, {displayName}!</p>
          </div>

          <div className="header-right">
            {/* Notification Bell */}
            <button className="header-icon-btn">
              <i className="fas fa-bell text-white hover:text-[#36FFDB] transition-colors"></i>
              <span className="notification-badge">0</span>
            </button>

            {/* Billing Icon */}
            <Link to="/dashboard/billing" className="header-icon-btn">
              <i className="fas fa-credit-card text-white hover:text-[#36FFDB] transition-colors"></i>
            </Link>

            {/* Documents Icon */}
            <Link to="/dashboard/documents" className="header-icon-btn">
              <i className="fas fa-file-invoice text-white hover:text-[#36FFDB] transition-colors"></i>
            </Link>

            {/* Profile Dropdown */}
            <div className="profile-dropdown-container">
              <button
                className="profile-trigger"
                onClick={toggleProfileDropdown}
                aria-haspopup="true"
                aria-expanded={showProfileDropdown}
              >
                <div className="avatar-circle">
                  {currentUser.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline ml-2">{displayName}</span>
                <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>

              {showProfileDropdown && (
                <div className="profile-dropdown-menu">
                  <Link to="/dashboard/account" className="dropdown-item">
                    <i className="fas fa-user mr-2"></i> My Account
                  </Link>
                  <Link to="/dashboard/settings" className="dropdown-item">
                    <i className="fas fa-cog mr-2"></i> Settings
                  </Link>
                  <Link to="/" className="dropdown-item">
                    <i className="fas fa-home mr-2"></i> Home Page
                  </Link>
                  {/* <Link to="/dashboard/billing" className="dropdown-item">
                    <i className="fas fa-credit-card mr-2"></i> Billing
                  </Link>
                  <Link to="/dashboard/documents" className="dropdown-item">
                    <i className="fas fa-file-invoice mr-2"></i> Documents
                  </Link> */}
                  {/* <div className="dropdown-divider"></div>
                  <button
                    onClick={handleSignOut}
                    className="dropdown-item text-red-400 hover:text-red-300"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                  </button> */}
                </div>
              )}
            </div>

            {/* Create Shipment Button */}
            <button
              className="btn-primaryses"
              onClick={() => navigate('/dashboard/new-shipment')}
            >
              <i className="fas fa-plus"></i> Create Shipment
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
