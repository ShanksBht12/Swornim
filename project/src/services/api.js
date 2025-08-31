import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9009/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: { 'Content-Type': 'application/json' }, // Removed to allow FormData uploads
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swornim_token');
    console.log('API Request Token:', token); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('swornim_token');
      localStorage.removeItem('swornim_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;