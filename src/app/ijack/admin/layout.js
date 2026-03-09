"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "../../../contexts/AdminAuthContext";
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
  "/ijack/admin/invoices": "Invoices",
  "/ijack/admin/promo-codes": "Promo Codes",
  "/ijack/admin/profile": "Profile",
};

const LOGIN_PATH = "/ijack/admin/login";

function AdminAuthGuard({ children }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === LOGIN_PATH;

  useEffect(() => {
    if (loading) return;
    if (!admin && !isLoginPage) {
      router.replace(LOGIN_PATH);
    }
  }, [admin, loading, isLoginPage, router]);

  // Not authenticated and not on login page: show brief message while redirecting
  if (!loading && !admin && !isLoginPage) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Redirecting to login...</div>
      </main>
    );
  }

  return children;
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isLoginPage = pathname === LOGIN_PATH;
  const navTitle = PAGE_TITLES[pathname] ?? "Admin";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
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
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
