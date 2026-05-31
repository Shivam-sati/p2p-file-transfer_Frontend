import axios from 'axios';
import type { ApiError } from '../types/api';

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data as ApiError | undefined;
    const message = data?.detail || err.message || 'Request failed';
    console.error(`[API] ${err.config?.url} → ${message}`);
    return Promise.reject(err);
  }
);

export default apiClient;