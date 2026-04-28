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

// Request interceptor for logging
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  const url = config.url;
  console.log(`%c🚀 API [REQUEST]: ${method} ${url}`, "color: #818cf8; font-weight: bold;");
  return config;
});

// Response interceptor to handle global errors and logging
api.interceptors.response.use(
  (response) => {
    const { method, url } = response.config;
    const status = response.status;
    console.log(`%c✅ API [SUCCESS]: ${method?.toUpperCase()} ${url} (${status})`, "color: #1D9E75; font-weight: bold;");
    return response;
  },
  (error) => {
    const { method, url } = error.config || {};
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.log(`%c❌ API [ERROR]: ${method?.toUpperCase()} ${url} (${status}) - ${message}`, "color: #E24B4A; font-weight: bold;");

    if (status === 401) {
      const requestUrl = url || '';
      if (!requestUrl.includes('/auth/me') && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
