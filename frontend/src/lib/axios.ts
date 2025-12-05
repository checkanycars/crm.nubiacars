import axios from 'axios';

// Configure axios defaults
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add Bearer token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    if (error.response?.status === 419) {
      // CSRF token mismatch
      console.error('CSRF token mismatch');
    }

    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access denied: insufficient permissions');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;