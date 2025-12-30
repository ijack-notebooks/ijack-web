"use client";

import { useContext } from "react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { SidebarContext } from "../app/ijack/admin/layout";

export default function AdminNavbar({ title }) {
  const { sidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const { admin, logout } = useAdminAuth();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-gray-300 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Welcome, {admin?.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

