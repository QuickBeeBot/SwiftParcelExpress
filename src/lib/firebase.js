// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider, // ✅ Import it
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential
} from 'firebase/auth';

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  getDocs
} from 'firebase/firestore';

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB3x1tmnYaYmWpC88NQxdEPjIfxd632wq8",
  authDomain: "agriverseapp.firebaseapp.com",
  projectId: "agriverseapp",
  storageBucket: "agriverseapp.firebasestorage.app",
  messagingSenderId: "991130033986",
  appId: "1:991130033986:web:943d2829e35423a9feb2db"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = EmailAuthProvider; // ✅ Export it

// ✅ Export all auth methods
export {
  // Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider, // ✅ Now exported
  GoogleAuthProvider
};

// Firestore
export {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  getDocs
};

// Storage
export {
  ref,
  uploadBytes,
  getDownloadURL
};

// // src/lib/firebase.js
// import { initializeApp } from 'firebase/app';
// import {
//   getAuth,
//   GoogleAuthProvider,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   sendPasswordResetEmail,
//   signInWithPopup,
//   updateProfile // ✅ Added
// } from 'firebase/auth';

// // ✅ Firestore
// import {
//   getFirestore,
//   collection,
//   doc,
//   setDoc,
//   getDoc,
//   updateDoc,
//   deleteDoc,
//   query,
//   where,
//   orderBy,
//   limit,
//   serverTimestamp,
//   addDoc,
//   getDocs
// } from 'firebase/firestore';

// // ✅ Storage (optional, for labels/profile pics)
// import {
//   getStorage,
//   ref,
//   uploadBytes,
//   getDownloadURL
// } from 'firebase/storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyB3x1tmnYaYmWpC88NQxdEPjIfxd632wq8",
//   authDomain: "agriverseapp.firebaseapp.com",
//   projectId: "agriverseapp",
//   storageBucket: "agriverseapp.firebasestorage.app",
//   messagingSenderId: "991130033986",
//   appId: "1:991130033986:web:943d2829e35423a9feb2db"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Services
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app); // ✅ Optional but recommended
// const googleProvider = new GoogleAuthProvider();

// // ✅ Export everything needed app-wide
// export {
//   // Firebase app & services
//   app,
//   auth,
//   db,
//   storage,

//   // Auth
//   googleProvider,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   sendPasswordResetEmail,
//   signInWithPopup,
//   updateProfile,

//   // Firestore
//   collection,
//   doc,
//   setDoc,
//   getDoc,
//   updateDoc,
//   deleteDoc,
//   query,
//   where,
//   orderBy,
//   limit,
//   serverTimestamp,
//   addDoc,
//   getDocs,

//   // Storage
//   ref,
//   uploadBytes,
//   getDownloadURL
// };


