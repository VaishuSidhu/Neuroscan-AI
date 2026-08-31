import axios from 'axios';

// Load base API url from environment variables
let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
if (!base.endsWith('/api')) {
    base = `${base}/api`;
}
const API_BASE_URL = base;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor: Attach JWT Token automatically if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neuro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Capture unauthorized codes for session resets
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token to log out user dynamically on expired/bad signatures
      localStorage.removeItem('neuro_token');
    }
    return Promise.reject(error);
  }
);
