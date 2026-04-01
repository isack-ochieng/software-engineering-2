// src/api.js
import axios from "axios";

const API_BASE = "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Improved Request Interceptor - Check both storages and log for debugging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  console.log("🔑 Token from storage:", token ? "Token found" : "No token found"); // ← Debug log

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header added"); // ← Debug log
  } else {
    console.warn("⚠️ No token found in localStorage or sessionStorage");
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("🚪 Unauthorized - clearing token and redirecting to login");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;