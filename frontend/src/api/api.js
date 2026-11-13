import axios from 'axios';

/**
 * API configuration:
 * Local:      http://localhost:5002/api
 * Production: https://ahadu-tech-academys.onrender.com/api
 */

const RAW = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5002/api'
    : 'https://ahadu-tech-academys.onrender.com/api')
).trim();

export const apiBaseURL = RAW.replace(/\/+$/, '');

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Path segments under /api
 * Example: auth/login
 */
export function apiPath(relativePath) {
  const p = String(relativePath || '').replace(/^\/+/, '');
  return `${apiBaseURL}/${p}`;
}

/**
 * Fetch helper with Bearer token.
 * Does not override FormData headers.
 */
export async function apiFetch(relativePath, options = {}) {
  const token = localStorage.getItem('token');
  const hdr = { ...(options.headers || {}) };

  if (token && !hdr.Authorization) {
    hdr.Authorization = `Bearer ${token}`;
  }

  return fetch(apiPath(relativePath), {
    ...options,
    headers: hdr,
    credentials: options.credentials || 'include',
  });
}

export default api;
