import axios from 'axios';
import { API_URL } from '@/constants/api';

/**
 * Configures the central HTTP client for the application.
 * It abstracts the base network configuration and provides a consistent interface 
 * for all external service interactions, including default headers and environment-aware URLs.
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle global errors like 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for /auth/me — it's expected to 401 for guests
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/auth/me') && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
