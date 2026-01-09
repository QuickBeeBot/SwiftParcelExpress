// ✅ src/main.jsx
import { createRoot } from 'react-dom/client';
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App';
import '@/index.css';
import '@/dash.css';

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <FirebaseAuthProvider>
      <LanguageProvider>   {/* ✅ Must wrap App */}
        <App />
      </LanguageProvider>
    </FirebaseAuthProvider>
  </HelmetProvider>
);

// // main.jsx
// import { createRoot } from 'react-dom/client';
// import { HelmetProvider } from 'react-helmet-async';
// import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';
// import App from './App';
// import '@/index.css';

// createRoot(document.getElementById('root')).render(
//   <HelmetProvider>
//     <FirebaseAuthProvider>
//       <App />
//     </FirebaseAuthProvider>
//   </HelmetProvider>
// );

// // main.jsx
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from '@/App';
// import '@/index.css';
// import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <FirebaseAuthProvider>
//       <App />
//     </FirebaseAuthProvider>
//   </React.StrictMode>
// );



// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from '@/App';
// import '@/index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <App />
// );
