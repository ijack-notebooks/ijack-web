import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests (check for admin token first, then regular token)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Check if this is an admin route
    const isAdminRoute = config.url?.startsWith("/admin");
    const token = isAdminRoute
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
