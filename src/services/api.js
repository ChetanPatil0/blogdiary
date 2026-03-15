import axios from 'axios';

export const API_BASE_URL ="http://localhost:5000/api";
export const MEDIA_BASE_URL = "http://localhost:5000"

export const api = axios.create({
   baseURL: "http://localhost:5000/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);



export default api;
