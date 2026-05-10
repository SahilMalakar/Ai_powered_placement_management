import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/constants/api';

/**
 * Configures the central HTTP client for the application.
 * It abstracts the base network configuration and provides a consistent interface 
 * for all external service interactions, including default headers and environment-aware URLs.
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }
    return searchParams.toString();
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const { method, url } = originalRequest || {};
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;
    const message = error.response?.data?.message || error.message;

    console.log(`%c❌ API [ERROR]: ${method?.toUpperCase()} ${url} (${status}) - ${message}`, "color: #E24B4A; font-weight: bold;");

    // Handle 401 Unauthorized / Token Expired
    if (status === 401 && !originalRequest._retry) {
      const requestUrl = url || '';
      
      // Don't attempt refresh for login, signup, or the refresh-token endpoint itself
      const isAuthRoute = requestUrl.includes('/auth/login') || 
                         requestUrl.includes('/auth/signup') || 
                         requestUrl.includes('/auth/refresh-token');

      if (!isAuthRoute) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('%c🔄 API [REFRESH]: Attempting to refresh tokens...', "color: #EF9F27; font-weight: bold;");
          await api.post('/auth/refresh-token');
          processQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.log('%c🚫 API [REFRESH_FAILED]: Redirecting to login', "color: #E24B4A; font-weight: bold;");
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // If it's an auth route or refresh failed, redirect if it's not the /auth/me check
      if (!requestUrl.includes('/auth/me') && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
