"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  // When any admin API returns 401 (e.g. token expired), api interceptor clears token and dispatches this event
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("adminToken");
      setAdmin(null);
    };
    window.addEventListener("admin-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("admin-unauthorized", handleUnauthorized);
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      const response = await api.get("/admin/auth/me");
      setAdmin(response.data.admin);
    } catch (error) {
      localStorage.removeItem("adminToken");
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post("/admin/auth/login", {
        username,
        password,
      });
      localStorage.setItem("adminToken", response.data.token);
      setAdmin(response.data.admin);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await api.post("/admin/auth/google", { id_token: idToken });
      localStorage.setItem("adminToken", response.data.token);
      setAdmin(response.data.admin);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Google sign-in failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
    router.push("/ijack/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, login, loginWithGoogle, logout, checkAdminAuth }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
