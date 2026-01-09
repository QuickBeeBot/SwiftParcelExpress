// src/components/Admin/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const notifRef = doc(db, 'notifications', user.uid);

    const unsubscribe = onSnapshot(notifRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNotifications(data.items || []);
        // Mark all as read
        if (data.unread_count > 0) {
          updateDoc(notifRef, {
            unread_count: 0,
            items: data.items.map(item => ({ ...item, read: true }))
          }).catch(console.error);
        }
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = (notif) => {
    if (notif.type === 'shipment' && notif.shipmentId) {
      navigate(`/admin/shipments/${notif.shipmentId}`);
    } else if (notif.type === 'ticket' && notif.ticketId) {
      navigate(`/admin/tickets/${notif.ticketId}`);
    }
  };

  if (loading) return <div className="notifications-page">Loading...</div>;

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h2><i className="fas fa-bell"></i> Notifications</h2>
        <button 
          className="btn-mark-all"
          onClick={() => {
            const auth = getAuth();
            const db = getFirestore();
            const ref = doc(db, 'notifications', auth.currentUser.uid);
            updateDoc(ref, {
              items: notifications.map(n => ({ ...n, read: true })),
              unread_count: 0
            });
          }}
        >
          Mark All as Read
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bell-slash"></i>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`notification-item ${notif.read ? '' : 'unread'}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notif-icon">
                {notif.type === 'shipment' && <i className="fas fa-box"></i>}
                {notif.type === 'ticket' && <i className="fas fa-ticket-alt"></i>}
                {notif.type === 'system' && <i className="fas fa-cog"></i>}
              </div>
              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <small>{new Date(notif.timestamp?.seconds * 1000).toLocaleString()}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;