
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
// import { initializeTheme } from './utils/theme';


import { AuthProvider } from './context/AuthContext';
import { initializeTheme } from './utils/theme';

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
