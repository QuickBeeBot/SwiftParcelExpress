// src/contexts/FirebaseAuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

const FirebaseAuthContext = createContext();

export function useAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

export function FirebaseAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;

    console.log('[FirebaseAuth] Initializing auth listener...');

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('[FirebaseAuth] Auth state changed →', user ? '✅ Signed in' : '❌ Signed out');
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('[FirebaseAuth] Fatal error:', error);
        setLoading(false); // Prevent infinite hang
      }
    );

    return () => {
      console.log('[FirebaseAuth] Cleaning up listener');
      unsubscribe();
    };
  }, []);

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const signOut = () => firebaseSignOut(auth);

  const value = { currentUser, loading, signIn, signUp, signOut };

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
}





// // src/contexts/AdminAuthContext.jsx
// import { createContext, useContext, useEffect, useState } from 'react';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';

// const AdminAuthContext = createContext();

// export function useAdminAuth() {
//   const context = useContext(AdminAuthContext);
//   if (!context) {
//     throw new Error('useAdminAuth must be used within an AdminAuthProvider');
//   }
//   return context;
// }

// export function AdminAuthProvider({ children }) {
//   const [adminUser, setAdminUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         // Check if user is admin
//         const userDoc = await getDoc(doc(db, 'users', user.uid));
//         if (userDoc.exists() && userDoc.data().role === 'admin') {
//           setAdminUser({ ...user, ...userDoc.data() });
//         } else {
//           setAdminUser(null);
//         }
//       } else {
//         setAdminUser(null);
//       }
//       setLoading(false);
//     });
//     return unsubscribe;
//   }, []);

//   return (
//     <AdminAuthContext.Provider value={{ adminUser, loading }}>
//       {children}
//     </AdminAuthContext.Provider>
//   );
// }