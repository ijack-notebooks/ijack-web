"use client";

import { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "../../../contexts/AdminAuthContext";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminNavbar from "../../../components/AdminNavbar";

export const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

const PAGE_TITLES = {
  "/ijack/admin": "Dashboard",
  "/ijack/admin/orders": "All Orders",
  "/ijack/admin/shipments": "Shipments",
  "/ijack/admin/products": "Products List",
  "/ijack/admin/product-types": "Type of Products",
  "/ijack/admin/profile": "Profile",
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isLoginPage = pathname === "/ijack/admin/login";
  const navTitle = PAGE_TITLES[pathname] ?? "Admin";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AdminAuthProvider>
      <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
        <div className="flex min-h-screen bg-gray-900">
          <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div
            className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
              sidebarOpen ? "lg:ml-64" : "lg:ml-0"
            }`}
          >
            {!isLoginPage && (
              <div className="shrink-0 sticky top-0 z-[60]">
                <AdminNavbar title={navTitle} />
              </div>
            )}
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </SidebarContext.Provider>
    </AdminAuthProvider>
  );
}
