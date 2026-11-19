
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
// import { initializeTheme } from './utils/theme';


import { AuthProvider } from './context/AuthContext';
import { initializeTheme } from './utils/theme';

// Register the app shell cache for offline React Router deep links.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Offline shell registration failed:', error)));
}

// Apply saved theme before React renders
initializeTheme();

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
