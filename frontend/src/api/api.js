import axios from 'axios';

/**
 * Resolved API root (leading slash for same-origin `/api`, or absolute like `https://host.onrender.com/api`).
 */
const RAW = (import.meta.env.VITE_API_URL || '/api').trim();
export const apiBaseURL = RAW.replace(/\/$/, '');

const api = axios.create({ baseURL: apiBaseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Path segments under `/api`, e.g. `content/admin/all`, `auth/login` */
export function apiPath(relativePath) {
  const p = String(relativePath || '').replace(/^\/?/, '');
  return `${apiBaseURL}/${p}`;
}

/** fetch() helper with Bearer token (does not alter FormData uploads) */
export async function apiFetch(relativePath, options = {}) {
  const token = localStorage.getItem('token');
  const hdr = { ...(options.headers || {}) };
  if (token && !hdr.Authorization) {
    hdr.Authorization = `Bearer ${token}`;
  }
  return fetch(apiPath(relativePath), {
    ...options,
    headers: hdr,
  });
}

export default api;
