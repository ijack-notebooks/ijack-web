"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import api from "../../../../lib/api";
import { formatPrice } from "../../../../lib/currency";

export default function AllOrders() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [shiprocketConfig, setShiprocketConfig] = useState(null);
  const [shiprocketLoading, setShiprocketLoading] = useState(false);
  const [shiprocketError, setShiprocketError] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [cancelRefundLoading, setCancelRefundLoading] = useState(false);
  const [cancelRefundError, setCancelRefundError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Try Supabase first, fallback to MongoDB
      let response;
      try {
        response = await api.get("/supabase/orders");
      } catch (supabaseError) {
        console.warn(
          "Supabase orders failed, falling back to MongoDB:",
          supabaseError,
        );
        // Fallback to MongoDB
        response = await api.get("/admin/orders");
      }

      let filteredOrders = response.data;

      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.status === statusFilter,
        );
      }

      if (paymentFilter !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.payment?.paymentStatus === paymentFilter,
        );
      }

      setOrders(filteredOrders);
    } catch (error) {
      setError("Failed to load orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter]);

  useEffect(() => {
    if (admin) {
      fetchOrders();
    }
  }, [admin, fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(response.data);
      }
    } catch (error) {
      alert("Failed to update order status");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!admin) return;
    api.get("/admin/shiprocket/config").then((r) => setShiprocketConfig(r.data)).catch(() => setShiprocketConfig({ configured: false }));
  }, [admin]);

  const shiprocketCreateOrder = async () => {
    if (!selectedOrder) return;
    setShiprocketLoading(true);
    setShiprocketError("");
    try {
      const res = await api.post("/admin/shiprocket/create-order", { orderId: selectedOrder._id });
      setSelectedOrder(res.data.order);
      await fetchOrders();
      router.push(`/ijack/admin/shipments?orderId=${selectedOrder._id}`);
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message || err.message || "Failed to create shipment";
      const details = data?.details;
      if (details != null) {
        msg += typeof details === "string" ? ` — ${details}` : ` — ${details?.message || details?.error || JSON.stringify(details)}`;
      }
      setShiprocketError(msg);
    } finally {
      setShiprocketLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm("Cancel this order? Order status will be set to cancelled." + (selectedOrder.shiprocket?.orderId ? " Any Shiprocket shipment will also be cancelled." : ""))) return;
    setCancelRefundLoading(true);
    setCancelRefundError("");
    try {
      const res = await api.post(`/admin/orders/${selectedOrder._id}/cancel`);
      setSelectedOrder(res.data);
      await fetchOrders();
    } catch (err) {
      setCancelRefundError(err.response?.data?.message || err.message || "Failed to cancel order");
    } finally {
      setCancelRefundLoading(false);
    }
  };

  const refundOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm(`Refund ${formatPrice(selectedOrder.totalAmount)} for this order? The payment will be refunded via ZWITCH and the order will be marked cancelled. This cannot be undone.`)) return;
    setCancelRefundLoading(true);
    setCancelRefundError("");
    try {
      const res = await api.post(`/admin/orders/${selectedOrder._id}/refund`);
      setSelectedOrder(res.data.order);
      await fetchOrders();
    } catch (err) {
      setCancelRefundError(err.response?.data?.message || err.message || "Refund failed");
    } finally {
      setCancelRefundLoading(false);
    }
  };

  const getShipmentStatus = (order) => {
    if (!order?.shiprocket?.orderId) return { label: "No shipment", className: "bg-gray-700 text-gray-400" };
    const liveStatus = order.shiprocket?.trackingStatus;
    if (liveStatus) {
      const normalized = String(liveStatus).toLowerCase();
      if (normalized.includes("delivered")) {
        return { label: liveStatus, className: "bg-green-900/60 text-green-300" };
      }
      if (normalized.includes("cancel")) {
        return { label: liveStatus, className: "bg-red-900/60 text-red-300" };
      }
      return { label: liveStatus, className: "bg-cyan-900/60 text-cyan-300" };
    }
    if (!order.shiprocket.awbCode) return { label: "Created", className: "bg-blue-900/60 text-blue-300" };
    return { label: "AWB assigned", className: "bg-green-900/60 text-green-300" };
  };

  const fetchTracking = async () => {
    const awb = selectedOrder?.shiprocket?.awbCode;
    if (!awb) return;
    setTrackingLoading(true);
    setTrackingError("");
    setTrackingData(null);
    try {
      const res = await api.get(`/admin/shiprocket/track/${encodeURIComponent(awb)}`);
      setTrackingData(res.data);
    } catch (err) {
      setTrackingError(err.response?.data?.message || err.message || "Failed to load tracking");
    } finally {
      setTrackingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Filter and Orders Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">Orders</h2>
                  <div className="bg-green-900/30 border border-green-700 text-green-300 px-2 py-1 rounded text-xs font-medium">
                    📊 Supabase
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={fetchOrders}
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
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Payments</option>
                    <option value="SUCCESS">Paid</option>
                    <option value="PENDING">Pending Payment</option>
                    <option value="FAILED">Failed</option>
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
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Shipment
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
                        colSpan="9"
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
                              order.payment?.paymentStatus === "SUCCESS"
                                ? "bg-green-900 text-green-300"
                                : order.payment?.paymentStatus === "FAILED"
                                  ? "bg-red-900 text-red-300"
                                  : "bg-yellow-900 text-yellow-300"
                            }`}
                          >
                            {order.payment?.paymentStatus || "PENDING"}
                          </span>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const s = getShipmentStatus(order);
                            return (
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.className}`} title={order.shiprocket?.awbCode ? `AWB: ${order.shiprocket.awbCode}` : undefined}>
                                {s.label}
                              </span>
                            );
                          })()}
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
                  onClick={() => {
                    setSelectedOrder(null);
                    setShiprocketError("");
                    setTrackingData(null);
                    setTrackingError("");
                    setCancelRefundError("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
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
                  <div>
                    <p className="text-gray-400 text-sm">Payment Status</p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full inline-block mt-1 ${
                        selectedOrder.payment?.paymentStatus === "SUCCESS"
                          ? "bg-green-900 text-green-300"
                          : selectedOrder.payment?.paymentStatus === "FAILED"
                            ? "bg-red-900 text-red-300"
                            : "bg-yellow-900 text-yellow-300"
                      }`}
                    >
                      {selectedOrder.payment?.paymentStatus || "PENDING"}
                    </span>
                  </div>
                </div>

                {selectedOrder.payment && (
                  <div>
                    <p className="text-gray-400 text-sm mb-3">
                      Payment Details
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                      <p className="text-white text-sm">
                        <span className="text-gray-400">
                          Merchant Order ID:
                        </span>{" "}
                        {selectedOrder.payment.merchantOrderId || "N/A"}
                      </p>
                      <p className="text-white text-sm">
                        <span className="text-gray-400">Transaction ID:</span>{" "}
                        {selectedOrder.payment.paymentTransactionId || selectedOrder.payment.phonepeTransactionId || "N/A"}
                      </p>
                      <p className="text-white text-sm">
                        <span className="text-gray-400">Method:</span>{" "}
                        {selectedOrder.payment.paymentMethod || "Online"}
                      </p>
                    </div>
                  </div>
                )}

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

                {/* Cancel & Refund */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Cancel & Refund</p>
                  {cancelRefundError && (
                    <p className="text-red-400 text-sm mb-2">{cancelRefundError}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={cancelOrder}
                        disabled={cancelRefundLoading}
                        className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        {cancelRefundLoading ? "..." : "Cancel order"}
                      </button>
                    )}
                    {selectedOrder.payment?.paymentStatus === "SUCCESS" && !selectedOrder.payment?.refundedAt && selectedOrder.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={refundOrder}
                        disabled={cancelRefundLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        {cancelRefundLoading ? "..." : "Refund payment"}
                      </button>
                    )}
                    {selectedOrder.payment?.refundedAt && (
                      <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-400">
                        Refunded on {new Date(selectedOrder.payment.refundedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cancel: sets order to cancelled and cancels Shiprocket shipment if any. Refund: processes refund via ZWITCH and marks order cancelled.
                  </p>
                </div>

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

                {/* Shiprocket Delivery */}
                <div>
                  <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    Shiprocket Delivery
                    {shiprocketConfig?.testMode && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-600 text-amber-100">
                        Test mode
                      </span>
                    )}
                  </p>
                  {!shiprocketConfig?.configured ? (
                    <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 text-amber-200 text-sm">
                      Shiprocket is not configured. Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to the server .env, or set SHIPROCKET_TEST_MODE=true for test mode. See SHIPROCKET_INTEGRATION.md.
                    </div>
                  ) : (
                    <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                      {shiprocketError && (
                        <p className="text-red-400 text-sm">{shiprocketError}</p>
                      )}
                      {selectedOrder.shiprocket?.orderId ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShipmentStatus(selectedOrder).className}`}>
                                Shipment: {getShipmentStatus(selectedOrder).label}
                              </span>
                              {selectedOrder.shiprocket?.courierName && (
                                <span className="text-sm text-gray-400">
                                  {selectedOrder.shiprocket.courierName}
                                </span>
                              )}
                              <span className="text-sm text-gray-400">
                                SR Order: {selectedOrder.shiprocket.orderId}
                              </span>
                              {selectedOrder.shiprocket?.awbCode && (
                                <span className="text-sm text-gray-400 font-mono">
                                  AWB: {selectedOrder.shiprocket.awbCode}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedOrder.shiprocket?.awbCode && (
                                <button
                                  type="button"
                                  onClick={fetchTracking}
                                  disabled={trackingLoading}
                                  className="inline-flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                                >
                                  {trackingLoading ? "Loading…" : "Track shipment"}
                                </button>
                              )}
                              <Link
                                href={`/ijack/admin/shipments?orderId=${selectedOrder._id}`}
                                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
                              >
                                View Shipment
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </Link>
                            </div>
                          </div>

                          {/* Tracking details */}
                          {trackingError && (
                            <p className="text-red-400 text-sm">{trackingError}</p>
                          )}
                          {trackingData && (
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Tracking details</p>
                              {trackingData.testMode && (
                                <p className="text-amber-400 text-xs mb-2">(Test mode – mock data)</p>
                              )}
                              <div className="space-y-3 text-sm">
                                <div className="flex flex-wrap gap-4">
                                  <div>
                                    <span className="text-gray-400">Status: </span>
                                    <span className="text-white font-medium">
                                      {trackingData.tracking_data?.status ?? trackingData.tracking_data?.current_status ?? trackingData.tracking_data?.track_status ?? trackingData.shipment_status ?? "—"}
                                    </span>
                                  </div>
                                  {(trackingData.tracking_data?.edd || trackingData.tracking_data?.etd) && (
                                    <div>
                                      <span className="text-gray-400">EDD: </span>
                                      <span className="text-white">
                                        {new Date(trackingData.tracking_data.edd || trackingData.tracking_data.etd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {(() => {
                                  const scans = trackingData.tracking_data?.scan
                                    ?? trackingData.tracking_data?.shipment_track_activities
                                    ?? [];
                                  return Array.isArray(scans) && scans.length > 0 ? (
                                    <div>
                                      <p className="text-gray-400 mb-2">Activity</p>
                                      <ul className="space-y-2">
                                        {scans.map((s, i) => (
                                          <li key={i} className="flex flex-wrap gap-x-2 gap-y-1 text-gray-300 border-l-2 border-gray-600 pl-3 py-1">
                                            <span className="text-gray-500 text-xs shrink-0">
                                              {s.date ? new Date(s.date).toLocaleString("en-IN") : "—"}
                                            </span>
                                            <span className="text-white">{s.activity ?? s.status ?? s["sr-status-label"] ?? "—"}</span>
                                            {(s.location || s.origin) && <span className="text-gray-400">· {s.location ?? s.origin}</span>}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : trackingData.tracking_data ? (
                                    <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-48">
                                      {JSON.stringify(trackingData.tracking_data, null, 2)}
                                    </pre>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : selectedOrder.status === "cancelled" || selectedOrder.payment?.refundedAt ? (
                        <p className="text-amber-400 text-sm">
                          Shipment cannot be created for cancelled or refunded orders.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={shiprocketCreateOrder}
                            disabled={shiprocketLoading}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium"
                          >
                            {shiprocketLoading ? "..." : "Create Shipment"}
                          </button>
                          <p className="text-xs text-gray-400 self-center">
                            You will be taken to the Shipments page to assign AWB, get label, and track.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
