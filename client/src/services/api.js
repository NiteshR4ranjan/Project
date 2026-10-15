import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const apiOrigin = configuredApiUrl
  ? `${/^https?:\/\//i.test(configuredApiUrl) ? '' : 'https://'}${configuredApiUrl}`
  : '';

const api = axios.create({
  baseURL: apiOrigin
    ? `${apiOrigin}${apiOrigin.endsWith('/api') ? '' : '/api'}`
    : 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically append JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dealkart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth or on login page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        // Optional: clear stale token
        // localStorage.removeItem('dealkart_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
