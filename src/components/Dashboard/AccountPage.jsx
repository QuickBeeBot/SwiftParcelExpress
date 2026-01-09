// src/components/Dashboard/AccountPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  db,
  auth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './AccountPage.css';

const AccountPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          id: currentUser.uid,
          name: data.name || currentUser.displayName || '',
          email: data.email || currentUser.email || '',
          phone: data.phone || '',
          address: data.address || '',
          plan: data.plan || 'Free Plan',
          lastLogin: data.lastLogin?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          twoFactorEnabled: data.twoFactorEnabled || false
        });
        setTwoFactorEnabled(data.twoFactorEnabled || false);
        setEditForm({
          name: data.name || currentUser.displayName || '',
          email: data.email || currentUser.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } else {
        // Fallback to Auth profile
        setUser({
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email.split('@')[0] || '',
          email: currentUser.email || '',
          phone: '',
          address: '',
          plan: 'Free Plan',
          lastLogin: new Date(),
          createdAt: new Date(),
          twoFactorEnabled: false
        });
        setEditForm({
          name: currentUser.displayName || currentUser.email.split('@')[0] || '',
          email: currentUser.email || '',
          phone: '',
          address: ''
        });
      }

      // Mock sessions (in prod: fetch from /sessions)
      setSessions([
        { device: 'Chrome on macOS', location: 'London, UK', ip: '192.0.2.1', time: new Date(Date.now() - 3600000), current: true },
        { device: 'Safari on iOS', location: 'New York, USA', ip: '203.0.113.45', time: new Date(Date.now() - 86400000), current: false }
      ]);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load account data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Save profile
  const handleSaveProfile = async () => {
    if (!user || !currentUser) return;

    try {
      setLoading(true);
      setError('');

      // Update Firebase Auth profile
      if (editForm.name !== user.name) {
        await updateProfile(currentUser, { displayName: editForm.name });
      }

      // Update email (requires re-auth)
      if (editForm.email !== user.email) {
        if (!passwordForm.currentPassword) {
          setError('Current password is required to change email.');
          setLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updateEmail(currentUser, editForm.email);
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.id), {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        updatedAt: new Date()
      });

      // Update local state
      setUser(prev => ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address
      }));

      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      // Clear form & close
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      alert('Password updated successfully!');
    } catch (err) {
      console.error('Password change failed:', err);
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle 2FA
  const toggleTwoFactor = async () => {
    try {
      setLoading(true);
      const newValue = !twoFactorEnabled;
      await updateDoc(doc(db, 'users', user.id), {
        twoFactorEnabled: newValue,
        updatedAt: new Date()
      });
      setTwoFactorEnabled(newValue);
      setUser(prev => ({ ...prev, twoFactorEnabled: newValue }));
    } catch (err) {
      console.error('2FA update failed:', err);
      alert('Failed to update 2FA setting.');
    } finally {
      setLoading(false);
    }
  };

  // Revoke session
  const revokeSession = (index) => {
    if (window.confirm('Are you sure you want to sign out this device?')) {
      setSessions(prev => prev.filter((_, i) => i !== index));
      // In prod: call Cloud Function to revoke token
    }
  };

  if (loading && !user) {
    return (
      <div className="account-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading account data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="page-header">
        <h1>Account Settings</h1>
        {user && (
          <button 
            className="btn-primarys"
            onClick={() => setEditMode(!editMode)}
            disabled={loading}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {/* Profile Section */}
      <div className="account-info">
        <div className="info-section">
          <h2>Personal Information</h2>
          {editMode ? (
            <div className="edit-form">
              <div className="form-row">
                <label>Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <label>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="form-row">
                <label>Address:</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  rows="2"
                />
              </div>
              {editForm.email !== user?.email && (
                <div className="form-row">
                  <label>Current Password (to change email):</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                  />
                </div>
              )}
              <div className="edit-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setEditMode(false);
                    setError('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="info-row">
                <strong>Name:</strong> <span>{user?.name}</span>
              </div>
              <div className="info-row">
                <strong>Email:</strong> <span>{user?.email}</span>
              </div>
              <div className="info-row">
                <strong>Phone:</strong> <span>{user?.phone || '—'}</span>
              </div>
              <div className="info-row">
                <strong>Address:</strong> <span>{user?.address || '—'}</span>
              </div>
            </>
          )}
        </div>

        <div className="info-section">
          <h2>Account Details</h2>
          <div className="info-row">
            <strong>Plan:</strong> <span>{user?.plan}</span>
          </div>
          <div className="info-row">
            <strong>Last Login:</strong> <span>{user?.lastLogin?.toLocaleString() || '—'}</span>
          </div>
          <div className="info-row">
            <strong>Member Since:</strong> <span>{user?.createdAt?.toLocaleDateString() || '—'}</span>
          </div>
          <div className="info-row">
            <strong>User ID:</strong> <span className="user-id">{user?.id}</span>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="security-section">
        <h2>Security</h2>
        
        <button 
          className="btn-secondary"
          onClick={() => setShowPasswordModal(true)}
        >
          <i className="fas fa-key"></i> Change Password
        </button>

        <div className="two-factor">
          <div>
            <h3>Two-Factor Authentication</h3>
            <p>Add an extra layer of security to your account.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={toggleTwoFactor}
              disabled={loading}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="session-section">
          <div className="session-header">
            <h3>Active Sessions</h3>
            <button className="btn-link">Sign out of all devices</button>
          </div>
          <div className="sessions-list">
            {sessions.map((session, index) => (
              <div key={index} className="session-item">
                <div className="session-info">
                  <div className="session-device">{session.device}</div>
                  <div className="session-meta">
                    <span>{session.location}</span>
                    <span>•</span>
                    <span>{session.ip}</span>
                    <span>•</span>
                    <span>{session.time.toLocaleString()}</span>
                  </div>
                </div>
                {session.current ? (
                  <span className="session-current">Current</span>
                ) : (
                  <button 
                    className="btn-revoke"
                    onClick={() => revokeSession(index)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Repeat new password"
                />
              </div>
              {error && (
                <div className="modal-error">
                  {error}
                </div>
              )}
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;








// // src/components/Dashboard/AccountPage.jsx
// import React, { useState, useEffect } from 'react';
// import './AccountPage.css';

// const AccountPage = () => {
//   const [user, setUser] = useState({
//     name: 'Geofstar22',
//     email: 'geofstar22@gmail.com',
//     phone: '+1 555 123 4567',
//     address: '123 Main St, Anytown, USA',
//     plan: 'Pro Plan',
//     lastLogin: '2025-06-18 14:30'
//   });

//   return (
//     <div className="account-page">
//       <div className="page-header">
//         <h1>Account</h1>
//         <button className="btn-primarys">Edit Profile</button>
//       </div>

//       <div className="account-info">
//         <div className="info-section">
//           <h2>Personal Information</h2>
//           <div className="info-row">
//             <strong>Name:</strong> <span>{user.name}</span>
//           </div>
//           <div className="info-row">
//             <strong>Email:</strong> <span>{user.email}</span>
//           </div>
//           <div className="info-row">
//             <strong>Phone:</strong> <span>{user.phone}</span>
//           </div>
//           <div className="info-row">
//             <strong>Address:</strong> <span>{user.address}</span>
//           </div>
//         </div>

//         <div className="info-section">
//           <h2>Account Details</h2>
//           <div className="info-row">
//             <strong>Plan:</strong> <span>{user.plan}</span>
//           </div>
//           <div className="info-row">
//             <strong>Last Login:</strong> <span>{user.lastLogin}</span>
//           </div>
//           <div className="info-row">
//             <strong>Member Since:</strong> <span>2025-01-01</span>
//           </div>
//         </div>
//       </div>

//       <div className="security-section">
//         <h2>Security</h2>
//         <button className="btn-secondary">Change Password</button>
//         <button className="btn-secondary">Two-Factor Authentication</button>
//         <button className="btn-secondary">Session Management</button>
//       </div>
//     </div>
//   );
// };

// export default AccountPage;






