import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ijack-server.onrender.com/api";

// Log API URL in development to help debug
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("API URL:", API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 401 errors for /auth/me endpoint - these are expected when tokens are invalid/expired
    const isAuthCheck = error.config?.url === "/auth/me" && error.response?.status === 401;
    
    if (error.response) {
      // Server responded with error status
      if (!isAuthCheck) {
        console.error("API Error:", error.response.status, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("API Error: No response received", error.request);
    } else {
      // Something else happened
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Add token to requests (check for admin token first, then regular token)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Check if this is an admin route or Supabase route (both need admin token)
    const isAdminRoute = config.url?.startsWith("/admin") || config.url?.startsWith("/supabase");
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
