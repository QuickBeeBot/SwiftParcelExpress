// src/contexts/FirebaseAuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

// Create the context
const FirebaseAuthContext = createContext(undefined);

// Custom hook to access Firebase auth state and methods
export function useAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

// Firebase Auth Provider Component
export function FirebaseAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double subscription in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    console.log('[FirebaseAuth] Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('[FirebaseAuth] Auth state updated →', user ? '✅ Signed in' : '❌ Signed out');
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('[FirebaseAuth] Auth error during initialization:', error);
        setLoading(false); // Avoid infinite loading
      }
    );

    // Cleanup on unmount
    return () => {
      console.log('[FirebaseAuth] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Auth methods
  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  // Provide auth state and methods to the app
  const value = {
    currentUser,
    loading, // `true` only during initial auth state resolution
    signIn,
    signUp,
    signOut,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

// // FirebaseAuthContext.jsx
// import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut as firebaseSignOut,
// } from 'firebase/auth';
// import { auth } from '../lib/firebaseClient';

// const FirebaseAuthContext = createContext();

// export function useAuth() {
//   const context = useContext(FirebaseAuthContext);
//   if (!context) throw new Error('useAuth must be used within FirebaseAuthProvider');
//   return context;
// }

// export function FirebaseAuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const unsubscribeRef = useRef();

//   useEffect(() => {
//     if (unsubscribeRef.current) return; // Prevent duplicate setup

//     console.log('Setting up Firebase auth listener...');
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       console.log('Auth state changed:', user ? 'Signed in' : 'Signed out');
//       setCurrentUser(user);
//       setLoading(false);
//     });

//     unsubscribeRef.current = unsubscribe;

//     return () => {
//       if (unsubscribeRef.current) {
//         console.log('Cleaning up Firebase auth listener');
//         unsubscribeRef.current();
//         unsubscribeRef.current = null;
//       }
//     };
//   }, []);

//   const signIn = (email, password) => {
//     return signInWithEmailAndPassword(auth, email, password);
//   };

//   const signUp = (email, password) => {
//     return createUserWithEmailAndPassword(auth, email, password);
//   };

//   const signOut = () => {
//     return firebaseSignOut(auth);
//   };

//   const value = {
//     currentUser,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//   };

//   return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
// }

