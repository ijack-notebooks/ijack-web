"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../contexts/AdminAuthContext";
import api from "../../../lib/api";
import { formatPrice } from "../../../lib/currency";

export default function AdminPanel() {
  const { admin, loading: authLoading, logout } = useAdminAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push("/ijack/admin/login");
    }
  }, [admin, authLoading, router]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/orders");
      let filteredOrders = response.data;

      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.status === statusFilter
        );
      }

      setOrders(filteredOrders);
    } catch (error) {
      setError("Failed to load orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchOrders();
      fetchStats();
    }
  }, [admin, fetchOrders, fetchStats]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      // Refresh orders and stats
      await fetchOrders();
      await fetchStats();
      // Update selected order with fresh data
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(response.data);
      }
    } catch (error) {
      alert("Failed to update order status");
      console.error(error);
    }
  };

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
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                Ijack Notebooks - Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Welcome, {admin.username}</span>
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

          {/* Filter and Orders Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">All Orders</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      fetchOrders();
                      fetchStats();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    🔄 Refresh
                  </button>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-mono">
                            {order._id.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {order.user?.username || "N/A"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.contactDetails?.email || order.user?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">
                            {order.items.length} item(s)
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.items
                              .map((item) => item.notebook?.name || "Notebook")
                              .join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-400">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-900 text-green-300"
                                : order.status === "pending"
                                ? "bg-yellow-900 text-yellow-300"
                                : order.status === "processing"
                                ? "bg-blue-900 text-blue-300"
                                : order.status === "shipped"
                                ? "bg-purple-900 text-purple-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID</p>
                    <p className="text-white font-mono text-sm">
                      {selectedOrder._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Customer</p>
                    <p className="text-white">
                      {selectedOrder.user?.username || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-blue-400 font-bold text-lg">
                      {formatPrice(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Order Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, status)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.status === status
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-gray-400 text-sm mb-3">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 rounded-lg p-4 flex justify-between"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {item.notebook?.name || "Notebook"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Quantity: {item.quantity} ×{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="text-blue-400 font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <p className="text-gray-400 text-sm mb-3">Contact Details</p>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-white">
                      <span className="text-gray-400">Name:</span>{" "}
                      {selectedOrder.contactDetails?.name}
                    </p>
                    <p className="text-white">
                      <span className="text-gray-400">Email:</span>{" "}
                      {selectedOrder.contactDetails?.email}
                    </p>
                    <p className="text-white">
                      <span className="text-gray-400">Phone:</span>{" "}
                      {selectedOrder.contactDetails?.phone}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <p className="text-gray-400 text-sm mb-3">Delivery Address</p>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-white">
                      {selectedOrder.address?.street}
                    </p>
                    <p className="text-white">
                      {selectedOrder.address?.city},{" "}
                      {selectedOrder.address?.state}{" "}
                      {selectedOrder.address?.zipCode}
                    </p>
                    <p className="text-white">
                      {selectedOrder.address?.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
