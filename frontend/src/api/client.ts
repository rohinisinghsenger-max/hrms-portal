import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      // Pydantic validation errors come as an array
      if (Array.isArray(detail)) {
        const messages = detail.map((d: { msg: string }) => d.msg).join(', ');
        return Promise.reject(new Error(messages));
      }
      return Promise.reject(new Error(detail));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Check your connection.'));
    }
    return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
  },
);
