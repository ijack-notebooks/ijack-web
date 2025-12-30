"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../contexts/AdminAuthContext";
import AdminNavbar from "../../../components/AdminNavbar";
import api from "../../../lib/api";
import { formatPrice } from "../../../lib/currency";

export default function AdminPanel() {
  const { admin, loading: authLoading, logout } = useAdminAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push("/ijack/admin/login");
    }
  }, [admin, authLoading, router]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchStats();
    }
  }, [admin, fetchStats]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <>
      <AdminNavbar title="Dashboard" />
      <main className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-gray-400">Manage orders and view statistics</p>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-white">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-blue-400">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm mb-2">Pending Orders</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.ordersByStatus.find((s) => s._id === "pending")
                    ?.count || 0}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-gray-400 text-sm mb-2">Delivered</h3>
                <p className="text-3xl font-bold text-green-400">
                  {stats.ordersByStatus.find((s) => s._id === "delivered")
                    ?.count || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
