// src/components/Admin/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ role: 'user' });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        // const userList = querySnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data(),
        //   createdAt: doc.data().createdAt?.toDate() || new Date()
        // }));
        const userList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let createdAt = new Date(); // fallback

          if (data.createdAt) {
            // If it's a Firestore Timestamp
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            }
            // If it's a string (ISO date)
            else if (typeof data.createdAt === 'string') {
              createdAt = new Date(data.createdAt);
            }
            // If it's a number (Unix timestamp)
            else if (typeof data.createdAt === 'number') {
              createdAt = new Date(data.createdAt);
            }
          }

          return {
            id: doc.id,
            ...data,
            createdAt
          };
        });

        setUsers(userList);
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Update user role
  const handleUpdateRole = async (userId, role) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
        updatedAt: serverTimestamp()
      });

      // Optimistic UI update
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role } : u
      ));
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update user role.');
    }
  };

  // Start editing
  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ role: user.role || 'user' });
  };

  // Save edit
  const handleSave = async (userId) => {
    await handleUpdateRole(userId, editForm.role);
    setEditingId(null);
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingId(null);
  };

  // Filter & search
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Format date
  // const formatDate = (date) => {
  //   return new Date(date).toLocaleDateString(undefined, {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   });
  // };
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };


  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>View, manage, and promote users</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Role</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No users found. Try adjusting your search or filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <code>{user.id.substring(0, 6)}</code>
                    </td>
                    <td>{user.name || '—'}</td>
                    <td>{user.email || '—'}</td>
                    <td>
                      <span className="plan-badge">
                        {user.plan || 'Free'}
                      </span>
                    </td>
                    <td>
                      {editingId === user.id ? (
                        <div className="edit-role">
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ role: e.target.value })}
                            className="role-select"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="edit-actions">
                            <button 
                              className="btn-small btn-success"
                              onClick={() => handleSave(user.id)}
                            >
                              Save
                            </button>
                            <button 
                              className="btn-small btn-secondary"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {editingId !== user.id && (
                        <button 
                          className="btn-small"
                          onClick={() => handleEdit(user)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && (
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="stat-label">Admins</div>
          </div>
          <div className="stat-card info">
            <div className="stat-value">
              {users.filter(u => u.plan && u.plan.includes('Pro')).length}
            </div>
            <div className="stat-label">Pro Users</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;



