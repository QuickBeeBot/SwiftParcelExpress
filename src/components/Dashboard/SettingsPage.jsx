// src/components/Dashboard/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: { email: true, sms: false, push: true },
    language: 'en',
    theme: 'dark',
    timezone: 'America/New_York',
    advanced: { apiAccess: false, thirdParty: false, autoExport: false }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      const settingsRef = doc(db, 'userSettings', currentUser.uid);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSettings({
          notifications: data.notifications || { email: true, sms: false, push: true },
          language: data.language || 'en',
          theme: data.theme || 'dark',
          timezone: data.timezone || 'America/New_York',
          advanced: data.advanced || { apiAccess: false, thirdParty: false, autoExport: false }
        });
      } else {
        // Default settings
        setSettings({
          notifications: { email: true, sms: false, push: true },
          language: 'en',
          theme: 'dark',
          timezone: 'America/New_York',
          advanced: { apiAccess: false, thirdParty: false, autoExport: false }
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save settings (debounced)
  const saveSettings = useCallback(async () => {
    if (!currentUser || saving) return;

    try {
      setSaving(true);
      setError('');

      const settingsData = {
        ...settings,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'userSettings', currentUser.uid), settingsData);

      // Update UI theme immediately
      document.documentElement.setAttribute('data-theme', settings.theme);
      localStorage.setItem('theme', settings.theme);

      // Update i18n language
      if (window.i18n) {
        window.i18n.changeLanguage(settings.language);
      }

      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [currentUser, settings, saving]);

  // Auto-save on change (debounced)
  useEffect(() => {
    if (loading) return;

    const handler = setTimeout(() => {
      saveSettings();
    }, 1000); // 1 second debounce

    return () => clearTimeout(handler);
  }, [settings, loading, saveSettings]);

  // Toggle handler
  const handleToggle = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  // Change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested settings
    if (name.includes('.')) {
      const [category, key] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <div className="header-actions">
          {lastSaved && (
            <span className="save-status">
                Last saved: {lastSaved}
            </span>
          )}
          <button 
            className="btn-primary"
            onClick={saveSettings}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert error">
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      )}

      {/* Settings */}
      {!loading && (
        <div className="settings-container">
          <div className="settings-section">
            <h2>Notifications</h2>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={() => handleToggle('notifications', 'email')}
                />
                Email Notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={() => handleToggle('notifications', 'sms')}
                />
                SMS Notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={() => handleToggle('notifications', 'push')}
                />
                Push Notifications
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h2>Preferences</h2>
            <div className="setting-item">
              <label>Language:</label>
              <select 
                value={settings.language} 
                onChange={handleChange} 
                name="language"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
                <option value="zh">中文</option>
                <option value="ru">Русский</option>
                <option value="sw">Kiswahili</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Theme:</label>
              <select 
                value={settings.theme} 
                onChange={handleChange} 
                name="theme"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Timezone:</label>
              <select 
                value={settings.timezone} 
                onChange={handleChange} 
                name="timezone"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="Europe/London">GMT (London)</option>
                <option value="Asia/Tokyo">Japan Standard Time</option>
                <option value="Africa/Nairobi">East Africa Time</option>
                <option value="Asia/Dubai">Gulf Standard Time</option>
                <option value="Australia/Sydney">Australian Eastern Time</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h2>Advanced</h2>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.advanced.apiAccess}
                  onChange={() => handleToggle('advanced', 'apiAccess')}
                />
                Enable API Access
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.advanced.thirdParty}
                  onChange={() => handleToggle('advanced', 'thirdParty')}
                />
                Allow Third-Party Integrations
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.advanced.autoExport}
                  onChange={() => handleToggle('advanced', 'autoExport')}
                />
                Export Data Monthly
              </label>
            </div>
          </div>

          <div className="settings-section danger-zone">
            <h2>Danger Zone</h2>
            <button 
              className="btn-danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                  navigate('/account/delete');
                }
              }}
            >
              <i className="fas fa-user-times"></i> Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;




// // src/components/Dashboard/SettingsPage.jsx
// import React, { useState, useEffect } from 'react';
// import './SettingsPage.css';

// const SettingsPage = () => {
//   const [settings, setSettings] = useState({
//     notifications: {
//       email: true,
//       sms: false,
//       push: true
//     },
//     language: 'en',
//     theme: 'dark',
//     timezone: 'America/New_York'
//   });

//   const handleToggle = (category, key) => {
//     setSettings(prev => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [key]: !prev[category][key]
//       }
//     }));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setSettings(prev => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="settings-page">
//       <div className="page-header">
//         <h1>Settings</h1>
//         <button className="btn-primarys">Save Changes</button>
//       </div>

//       <div className="settings-container">
//         <div className="settings-section">
//           <h2>Notifications</h2>
//           <div className="setting-item">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={settings.notifications.email}
//                 onChange={() => handleToggle('notifications', 'email')}
//               />
//               Email Notifications
//             </label>
//           </div>
//           <div className="setting-item">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={settings.notifications.sms}
//                 onChange={() => handleToggle('notifications', 'sms')}
//               />
//               SMS Notifications
//             </label>
//           </div>
//           <div className="setting-item">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={settings.notifications.push}
//                 onChange={() => handleToggle('notifications', 'push')}
//               />
//               Push Notifications
//             </label>
//           </div>
//         </div>

//         <div className="settings-section">
//           <h2>Preferences</h2>
//           <div className="setting-item">
//             <label>Language:</label>
//             <select value={settings.language} onChange={handleChange} name="language">
//               <option value="en">English</option>
//               <option value="fr">Français</option>
//               <option value="es">Español</option>
//               <option value="ar">العربية</option>
//               <option value="zh">中文</option>
//               <option value="ru">Русский</option>
//               <option value="sw">Kiswahili</option>
//             </select>
//           </div>
//           <div className="setting-item">
//             <label>Theme:</label>
//             <select value={settings.theme} onChange={handleChange} name="theme">
//               <option value="dark">Dark Mode</option>
//               <option value="light">Light Mode</option>
//             </select>
//           </div>
//           <div className="setting-item">
//             <label>Timezone:</label>
//             <select value={settings.timezone} onChange={handleChange} name="timezone">
//               <option value="America/New_York">Eastern Time (US & Canada)</option>
//               <option value="Europe/London">GMT (London)</option>
//               <option value="Asia/Tokyo">Japan Standard Time</option>
//             </select>
//           </div>
//         </div>

//         <div className="settings-section">
//           <h2>Advanced</h2>
//           <div className="setting-item">
//             <label>
//               <input type="checkbox" />
//               Enable API Access
//             </label>
//           </div>
//           <div className="setting-item">
//             <label>
//               <input type="checkbox" />
//               Allow Third-Party Integrations
//             </label>
//           </div>
//           <div className="setting-item">
//             <label>
//               <input type="checkbox" />
//               Export Data Monthly
//             </label>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsPage;






