import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
});

export function getApiErrorMessage(error) {
  const apiMessage = error.response?.data?.error?.message;
  if (apiMessage) return apiMessage;
  if (error.code === 'ECONNABORTED') return 'Mira took too long to respond. Please try again.';
  if (!error.response) return 'Mira is unavailable. Check that the backend is running and try again.';
  if (error.response.status >= 500) return 'Mira is having a problem. Please try again shortly.';
  return error.message || 'Something went wrong. Please try again.';
}
