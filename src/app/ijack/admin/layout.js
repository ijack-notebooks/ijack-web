"use client";

import { useState, createContext, useContext } from "react";
import { AdminAuthProvider } from "../../../contexts/AdminAuthContext";
import AdminSidebar from "../../../components/AdminSidebar";

export const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AdminAuthProvider>
      <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
        <div className="flex min-h-screen bg-gray-900">
          <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "lg:ml-64" : "lg:ml-0"
            }`}
          >
            {children}
          </div>
        </div>
      </SidebarContext.Provider>
    </AdminAuthProvider>
  );
}

