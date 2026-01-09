// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const notifRef = doc(db, 'notifications', user.uid);

    const unsubscribe = onSnapshot(notifRef, (docSnap) => {
      if (docSnap.exists()) {
        setUnreadCount(docSnap.data().unread_count || 0);
      } else {
        setUnreadCount(0);
      }
      setLoading(false);
    }, (error) => {
      console.error('Notifications listener error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};