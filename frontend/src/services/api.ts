import axios from 'axios';

const API_BASE_URL = 'https://admin-moderator-backend-staging.up.railway.app/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response.data, // Unwrap the API response to get the actual data
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
