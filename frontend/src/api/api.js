import axios from 'axios';

/**
 * API base URL policy:
 * - VITE_API_BASE_URL is the preferred setting.
 * - VITE_API_URL remains supported for existing deployments.
 * - Both values may be supplied with or without a trailing /api.
 * - Native Capacitor builds must use an absolute HTTPS backend URL.
 */
const DEFAULT_API_ORIGIN = import.meta.env.DEV
  ? 'http://localhost:5002'
  : 'https://ahadu-tech-academys.onrender.com';

function normalizeApiBase(rawValue) {
  const raw = String(rawValue || DEFAULT_API_ORIGIN).trim().replace(/\/+$/, '');
  // Collapse accidental repeated API prefixes, then guarantee exactly one /api.
  const originAndPath = raw.replace(/(?:\/api)+$/i, '');
  return `${originAndPath}/api`;
}

const configuredApiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_ORIGIN;

export const apiBaseURL = normalizeApiBase(configuredApiUrl);

function normalizeApiPath(relativePath) {
  let path = String(relativePath || '').trim().replace(/^\/+/, '');
  // Accept either "auth/login" or "/api/auth/login" without duplicating /api.
  path = path.replace(/^api(?:\/|$)/i, '').replace(/^\/+/, '');
  return path;
}

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
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let Axios/browser generate the multipart boundary for profile-photo uploads.
  // The instance-wide JSON default otherwise prevents Multer from parsing FormData.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers = config.headers || {};
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  // Keep every relative API request beneath the single configured /api prefix.
  if (typeof config.url === 'string' && !/^https?:\/\//i.test(config.url)) {
    config.url = `/${normalizeApiPath(config.url)}`;
  }

  return config;
});

/** Build an absolute URL for API routes, always beneath the normalized /api base. */
export function apiPath(relativePath) {
  const path = normalizeApiPath(relativePath);
  return path ? `${apiBaseURL}/${path}` : apiBaseURL;
}

/** Fetch helper with Bearer token. Does not override FormData headers. */
export async function apiFetch(relativePath, options = {}) {
  const token = localStorage.getItem('token');
  const hdr = { ...(options.headers || {}) };

  if (token && !hdr.Authorization) {
    hdr.Authorization = `Bearer ${token}`;
  }

  return fetch(apiPath(relativePath), {
    ...options,
    cache: options.cache || 'no-store',
    headers: hdr,
    credentials: options.credentials || 'include',
  });
}

export default api;
