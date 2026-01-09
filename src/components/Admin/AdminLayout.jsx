// src/components/Admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import {
  Home,
  Package,
  Clock,
  CheckCircle,
  Ticket,
  Users,
  BarChart3,
  Bell,
  Settings,
  Search,
  Plus,
  User,
  LogOut
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const { currentUser, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Close dropdown on route change
  useEffect(() => {
    setShowProfileDropdown(false);
  }, [location.pathname]);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
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
        <p>Access denied. Redirecting...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } catch (e) {
      console.error('Sign out failed:', e);
      alert('Failed to sign out.');
    }
  };

  const isActive = (path) => location.pathname === path;

  const displayName =
    currentUser.displayName ||
    currentUser.email?.split('@')[0] ||
    'Admin';

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src="/images/logo.png"
            alt="SwiftParcel Admin"
            className="admin-logo"
          />
        </div>

        <nav className="sidebar-nav">
          <SidebarItem to="/admin" active={isActive('/admin')} icon={<Home size={20} />} label="Dashboard" />
          <SidebarItem to="/admin/shipments" active={isActive('/admin/shipments')} icon={<Package size={20} />} label="All Shipments" />
          <SidebarItem to="/admin/pending-shipments" active={isActive('/admin/pending-shipments')} icon={<Clock size={20} />} label="Pending Review" />
          <SidebarItem to="/admin/completed-shipments" active={isActive('/admin/completed-shipments')} icon={<CheckCircle size={20} />} label="Completed" />
          <SidebarItem to="/admin/tickets" active={isActive('/admin/tickets')} icon={<Ticket size={20} />} label="Support Tickets" />
          <SidebarItem to="/admin/users" active={isActive('/admin/users')} icon={<Users size={20} />} label="Users" />
          <SidebarItem to="/admin/reports" active={isActive('/admin/reports')} icon={<BarChart3 size={20} />} label="Analytics" />
          <SidebarItem to="/admin/notifications" active={isActive('/admin/notifications')} icon={<Bell size={20} />} label="Notifications" />
          <SidebarItem to="/admin/settings" active={isActive('/admin/settings')} icon={<Settings size={20} />} label="System Settings" />
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {currentUser.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{displayName}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen && window.innerWidth < 768 ? 'blurred' : ''}`}>
        <header className="admin-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
          </div>

          <div className="header-right">
            {/* Search */}
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search shipments, users..." />
            </div>

            {/* Notification Bell */}
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="notification-badge">5</span>
            </button>

            {/* User Dropdown */}
            <div className="profile-dropdown-container">
              <button className="profile-trigger" onClick={toggleProfileDropdown}>
                <div className="avatar-circle">
                  {currentUser.email?.[0]?.toUpperCase() || 'A'}
                </div>
              </button>

              {showProfileDropdown && (
                <div className="profile-dropdown-menu">
                  <Link to="/admin/profile" className="dropdown-item">
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/admin/settings" className="dropdown-item">
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleSignOut}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action */}
            <button className="btn-primary" onClick={() => navigate('/admin/newshipment')}>
              <Plus size={18} /> New Shipment
            </button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Reusable Sidebar Item
const SidebarItem = ({ to, active, icon, label }) => (
  <Link to={to} className={`sidebar-link ${active ? 'active' : ''}`}>
    <span className="sidebar-icon">{icon}</span>
    <span className="sidebar-label">{label}</span>
  </Link>
);

export default AdminLayout;