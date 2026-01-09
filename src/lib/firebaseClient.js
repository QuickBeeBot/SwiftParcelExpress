// lib/firebaseClient.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB3x1tmnYaYmWpC88NQxdEPjIfxd632wq8",
  authDomain: "agriverseapp.firebaseapp.com",
  projectId: "agriverseapp",
  storageBucket: "agriverseapp.firebasestorage.app",
  messagingSenderId: "991130033986",
  appId: "1:991130033986:web:943d2829e35423a9feb2db",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);