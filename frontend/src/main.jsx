import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { initializeTheme } from './utils/theme';
import { initializeLiveUpdates } from './utils/appUpdates';

// Register the existing app-shell worker. Its cache namespace is separate
// from IndexedDB study materials and authentication storage.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Offline shell registration failed:', error)));
}

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Native OTA checks run after the initial UI render. On web/PWA, this is a no-op.
void initializeLiveUpdates();
