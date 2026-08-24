import axios from 'axios';
import { getAuthToken, removeAuthToken } from '@/utils/auth';

export const apiClient = axios.create({
  // Vite reads environment variables using import.meta.env
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('login')) {
      removeAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);