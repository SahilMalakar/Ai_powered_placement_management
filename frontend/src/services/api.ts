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

export default api;
