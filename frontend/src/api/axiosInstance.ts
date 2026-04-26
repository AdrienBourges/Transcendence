import axios from 'axios';
import { AUTH_TOKEN_KEY } from '@/utils/constants';

/**
 * 1. Base API configuration
 * Defines the base URL used for all API requests
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * 2. Create axios instance
 * Centralized HTTP client configuration
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 3. Request Interceptor
 * Automatically attach JWT token to every request
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Use centralized token key constant
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 4. Response Interceptor
 * Handle global API errors (e.g. unauthorized access)
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Session expired, please log in again');

      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('auth_token');

      // Optional redirect to login page
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
