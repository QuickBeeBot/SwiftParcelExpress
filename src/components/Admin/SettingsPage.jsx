// src/components/Admin/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../lib/firebase';
// import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import {
  doc,
  getDoc,
  getDocs,   //   ADD THIS
  setDoc,
  serverTimestamp,
  collection,
  addDoc
} from 'firebase/firestore';
import './SettingsPage.css';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // General
    siteName: 'SwiftParcel',
    siteUrl: 'https://swiftparcel.express',
    timezone: 'UTC',
    currency: 'USD',
    language: 'en',

    // Email
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    emailFrom: 'noreply@swiftparcel.express',
    emailReplyTo: 'support@swiftparcel.express',

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,

    // Security
    twoFactorRequired: false,
    sessionTimeout: 3600, // seconds
    ipWhitelist: [],

    // API
    apiRateLimit: 100,
    apiEnabled: true,

    // Features
    allowHazardous: false,
    requireClearance: true,
    autoApproveThreshold: 500
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API Keys
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKey, setNewApiKey] = useState({ name: '', scopes: ['read'], expires: '' });

  // Email templates
  const [templates, setTemplates] = useState({
    shipmentCreated: '',
    quoteReady: '',
    paymentConfirmed: '',
    shipmentDelivered: ''
  });

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const docRef = doc(db, 'admin', 'settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }

      // Fetch API keys
      const keysRef = collection(db, 'apiKeys');
      const keysSnap = await getDocs(keysRef);
      setApiKeys(keysSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch email templates
      const templatesRef = doc(db, 'emailTemplates', 'default');
      const templatesSnap = await getDoc(templatesRef);
      if (templatesSnap.exists()) {
        setTemplates(templatesSnap.data());
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save settings
  const saveSettings = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const settingsData = {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: 'admin_1'
      };

      await setDoc(doc(db, 'admin', 'settings'), settingsData);

      // Log audit
      await addDoc(collection(db, 'auditLogs'), {
        action: 'settings_updated',
        resource: 'admin_settings',
        userId: 'admin_1',
        timestamp: serverTimestamp(),
        changes: Object.keys(settingsData)
      });

      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Create API key
  const createApiKey = async () => {
    try {
      const keyData = {
        ...newApiKey,
        key: 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdBy: 'admin_1',
        createdAt: serverTimestamp(),
        lastUsed: null,
        usage: 0,
        active: true
      };

      await addDoc(collection(db, 'apiKeys'), keyData);
      setApiKeys(prev => [...prev, { id: Date.now().toString(), ...keyData }]);
      setNewApiKey({ name: '', scopes: ['read'], expires: '' });
      setSuccess('API key created!');
    } catch (err) {
      setError('Failed to create API key.');
    }
  };

  // Revoke API key
  const revokeApiKey = async (id) => {
    if (!window.confirm('Revoke this API key? This cannot be undone.')) return;

    try {
      await setDoc(doc(db, 'apiKeys', id), {
        active: false,
        revokedAt: serverTimestamp(),
        revokedBy: 'admin_1'
      }, { merge: true });

      setApiKeys(prev => prev.map(k => k.id === id ? { ...k, active: false } : k));
      setSuccess('API key revoked.');
    } catch (err) {
      setError('Failed to revoke API key.');
    }
  };

  // Save templates
  const saveTemplates = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, 'emailTemplates', 'default'), {
        ...templates,
        updatedAt: serverTimestamp()
      });
      setSuccess('Email templates saved.');
    } catch (err) {
      setError('Failed to save templates.');
    } finally {
      setSaving(false);
    }
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplates(prev => ({ ...prev, [name]: value }));
  };

  const isDirty = () => {
    // Implement dirty check if needed
    return true;
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Admin Settings</h1>
        <p>Configure system-wide preferences and integrations</p>
      </div>

      {/* Status */}
      {error && <div className="alert error">❌ {error}</div>}
      {success && <div className="alert success">  {success}</div>}

      <div className="settings-layout">
        {/* Sidebar Nav */}
        <aside className="settings-sidebar">
          <nav>
            <a href="#general" className="active">General</a>
            <a href="#email">Email</a>
            <a href="#notifications">Notifications</a>
            <a href="#security">Security</a>
            <a href="#api">API Keys</a>
            <a href="#templates">Email Templates</a>
            <a href="#audit">Audit Logs</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="settings-content">
          {/* General */}
          <section id="general" className="settings-section">
            <div className="section-headers">
              <h2><i className="fas fa-cog"></i> General Settings</h2>
              <button 
                className="btn-primarys"
                onClick={saveSettings}
                disabled={saving || !isDirty()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="form-grid">
              <div className="form-groupses">
                <label>Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-groupses">
                <label>Site URL</label>
                <input
                  type="url"
                  name="siteUrl"
                  value={settings.siteUrl}
                  onChange={handleChange}
                />
              </div>
              <div className="form-groupses">
                <label>Timezone</label>
                <select name="timezone" value={settings.timezone} onChange={handleChange}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Asia/Tokyo">Japan Standard</option>
                  <option value="Africa/Nairobi">East Africa</option>
                </select>
              </div>
              <div className="form-groupses">
                <label>Default Currency</label>
                <select name="currency" value={settings.currency} onChange={handleChange}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KES">KES (KSh)</option>
                </select>
              </div>
              <div className="form-groupses">
                <label>Default Language</label>
                <select name="language" value={settings.language} onChange={handleChange}>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="ar">العربية</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </section>

          {/* Email */}
          <section id="email" className="settings-section">
            <h2><i className="fas fa-envelope"></i> Email Settings</h2>
            <div className="form-grid">
              <div className="form-groupses">
                <label>SMTP Host</label>
                <input
                  type="text"
                  name="smtpHost"
                  value={settings.smtpHost}
                  onChange={handleChange}
                />
              </div>
              <div className="form-groupses">
                <label>SMTP Port</label>
                <input
                  type="number"
                  name="smtpPort"
                  value={settings.smtpPort}
                  onChange={handleChange}
                />
              </div>
              <div className="form-groupses">
                <label>SMTP Username</label>
                <input
                  type="text"
                  name="smtpUser"
                  value={settings.smtpUser}
                  onChange={handleChange}
                />
              </div>
              <div className="form-groupses">
                <label>From Address</label>
                <input
                  type="email"
                  name="emailFrom"
                  value={settings.emailFrom}
                  onChange={handleChange}
                />
              </div>
              <div className="form-groupses">
                <label>Reply-To Address</label>
                <input
                  type="email"
                  name="emailReplyTo"
                  value={settings.emailReplyTo}
                  onChange={handleChange}
                />
              </div>
              <div className="form-groupses">
                <label>SMTP Password</label>
                <div className="password-field">
                  <input
                    type="password"
                    name="smtpPassword"
                    value={settings.smtpPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <button type="button" className="btn-show">Show</button>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section id="notifications" className="settings-section">
            <h2><i className="fas fa-bell"></i> Notifications</h2>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                />
                Email Notifications
              </label>
              <label>
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                />
                SMS Notifications
              </label>
              <label>
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                />
                Push Notifications
              </label>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="settings-section">
            <h2><i className="fas fa-shield-alt"></i> Security</h2>
            <div className="form-grid">
              <div className="form-groupses">
                <label>
                  <input
                    type="checkbox"
                    name="twoFactorRequired"
                    checked={settings.twoFactorRequired}
                    onChange={handleChange}
                  />
                  Require 2FA for all users
                </label>
              </div>
              <div className="form-groupses">
                <label>Session Timeout (seconds)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  min="300"
                />
              </div>
              <div className="form-groupses">
                <label>IP Whitelist (comma-separated)</label>
                <textarea
                  value={settings.ipWhitelist.join(', ')}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ipWhitelist: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean)
                  }))}
                  rows="2"
                />
              </div>
            </div>
          </section>

          {/* API Keys */}
          <section id="api" className="settings-section">
            <div className="section-headers">
              <h2><i className="fas fa-key"></i> API Keys</h2>
              <button className="btn-secondary" onClick={createApiKey}>
                <i className="fas fa-plus"></i> Create Key
              </button>
            </div>

            {/* Create Form */}
            <div className="api-create">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Key Name (e.g., Mobile App)"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                />
                <select
                  value={newApiKey.scopes[0]}
                  onChange={(e) => setNewApiKey({ ...newApiKey, scopes: [e.target.value] })}
                >
                  <option value="read">Read Only</option>
                  <option value="read_write">Read & Write</option>
                  <option value="admin">Admin</option>
                </select>
                <input
                  type="date"
                  value={newApiKey.expires}
                  onChange={(e) => setNewApiKey({ ...newApiKey, expires: e.target.value })}
                />
                <button className="btn-primarys" onClick={createApiKey}>Create</button>
              </div>
            </div>

            {/* Keys List */}
            <div className="api-keys">
              {apiKeys.length === 0 ? (
                <p className="no-data">No API keys created yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key</th>
                      <th>Scopes</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map(key => (
                      <tr key={key.id}>
                        <td>{key.name}</td>
                        <td><code>{key.key.substring(0, 12)}...</code></td>
                        <td>{key.scopes.join(', ')}</td>
                        <td>{new Date(key.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${key.active ? 'success' : 'danger'}`}>
                            {key.active ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td>
                          {!key.active || (
                            <button 
                              className="btn-revoke"
                              onClick={() => revokeApiKey(key.id)}
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Email Templates */}
          <section id="templates" className="settings-section">
            <div className="section-headers">
              <h2><i className="fas fa-file-alt"></i> Email Templates</h2>
              <button 
                className="btn-primarys"
                onClick={saveTemplates}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Templates'}
              </button>
            </div>

            <div className="template-grid">
              <div className="template-item">
                <h3>Shipment Created</h3>
                <textarea
                  name="shipmentCreated"
                  value={templates.shipmentCreated}
                  onChange={handleTemplateChange}
                  placeholder="Dear {{name}}, your shipment {{tracking}} has been created..."
                  rows="4"
                />
              </div>
              <div className="template-item">
                <h3>Quote Ready</h3>
                <textarea
                  name="quoteReady"
                  value={templates.quoteReady}
                  onChange={handleTemplateChange}
                  placeholder="Your quote for shipment {{tracking}} is ready..."
                  rows="4"
                />
              </div>
              <div className="template-item">
                <h3>Payment Confirmed</h3>
                <textarea
                  name="paymentConfirmed"
                  value={templates.paymentConfirmed}
                  onChange={handleTemplateChange}
                  placeholder="Payment received for shipment {{tracking}}..."
                  rows="4"
                />
              </div>
              <div className="template-item">
                <h3>Shipment Delivered</h3>
                <textarea
                  name="shipmentDelivered"
                  value={templates.shipmentDelivered}
                  onChange={handleTemplateChange}
                  placeholder="Your package {{tracking}} has been delivered..."
                  rows="4"
                />
              </div>
            </div>
          </section>

          {/* Audit Logs */}
          <section id="audit" className="settings-section">
            <h2><i className="fas fa-history"></i> Audit Logs</h2>
            <div className="audit-logs">
              <p>Admin actions are automatically logged to Firestore `/auditLogs`.</p>
              <button className="btn-secondary">
                <i className="fas fa-download"></i> Export Logs (CSV)
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;




// SettingsPage.jsx:85 Failed to load settings: ReferenceError: getDocs is not defined
//     at SettingsPage.jsx:75:24
// (anonymous)	@	SettingsPage.jsx:85
// await in (anonymous)		
// (anonymous)	@	SettingsPage.jsx:93


// What is the cause of the error message ??