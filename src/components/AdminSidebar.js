"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/ijack/admin",
      icon: "📊",
    },
    {
      name: "All Orders",
      path: "/ijack/admin/orders",
      icon: "📦",
    },
    {
      name: "Products List",
      path: "/ijack/admin/products",
      icon: "📚",
    },
    {
      name: "Type of Products",
      path: "/ijack/admin/product-types",
      icon: "🏷️",
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Admin Menu</h2>
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => {
                    // Close sidebar on mobile when item is clicked
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

