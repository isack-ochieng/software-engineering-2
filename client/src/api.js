// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",   // Direct to backend - most reliable on Windows
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
  console.log("🔑 Token from storage:", token ? "Token found" : "No token found");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header added");
  } else {
    console.warn("⚠️ No token found");
  }

  return config;
}, (error) => Promise.reject(error));

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;