// src/api/axios.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "https://swavio-backend.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: false,
});

// Request Interceptor: automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: centralized error handling & 401 session clearing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || error.message;

    if (status === 401) {
      // Token expired or invalid
      console.warn("[API 401] Authentication expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    } else if (status === 403) {
      console.warn("[API 403] Access forbidden:", message);
    } else if (status >= 500) {
      console.error("[API 5xx] Backend server error:", message);
    }

    return Promise.reject(error);
  }
);

export default api;
