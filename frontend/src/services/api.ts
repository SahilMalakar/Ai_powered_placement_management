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
  return config;
});

// Response interceptor to handle global errors and logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const { url } = originalRequest || {};
    const status = error.response?.status;

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
          await api.post('/auth/refresh-token');
          processQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          
        // CRITICAL: Do not redirect to /login if the original request was the auth check or refresh token
        // This prevents infinite reload loops and allows unauthenticated users to stay on public pages.
        const isExcluded = requestUrl.includes('/auth/me') || requestUrl.includes('/auth/refresh-token');
        
        if (!isExcluded && typeof window !== 'undefined') {
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
      }
    }

    // If it's not a 401 or refresh was already tried, handle it here
    if (status === 401) {
      const requestUrl = url || '';
      const isExcluded = requestUrl.includes('/auth/me') || requestUrl.includes('/auth/refresh-token');

      if (!isExcluded && typeof window !== 'undefined') {
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
