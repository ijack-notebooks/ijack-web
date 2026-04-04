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
  const [shipmentHistoryOrder, setShipmentHistoryOrder] = useState(null);
  const [paymentHistoryOrder, setPaymentHistoryOrder] = useState(null);
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
  const [manualPaymentStatus, setManualPaymentStatus] = useState("PENDING");
  const [manualPaymentStatusLoading, setManualPaymentStatusLoading] = useState(false);
  const [manualPaymentStatusError, setManualPaymentStatusError] = useState("");
  const [refreshPaymentLoading, setRefreshPaymentLoading] = useState(false);
  const [refreshPaymentMessage, setRefreshPaymentMessage] = useState("");

  const roundTo2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

  const computeOrderBreakdown = useCallback((order) => {
    const subtotal = roundTo2(
      (order?.items || []).reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      )
    );
    const discountAmount = roundTo2(Math.max(0, Number(order?.discountAmount) || 0));
    const discountedSubtotal = roundTo2(Math.max(0, subtotal - discountAmount));
    const shippingCharge = roundTo2(Math.max(0, Number(order?.shipping?.charge) || 0));
    const total = roundTo2(Number(order?.totalAmount) || 0);
    const gstAmount = roundTo2(Math.max(0, total - discountedSubtotal - shippingCharge));
    return { subtotal, discountAmount, discountedSubtotal, shippingCharge, gstAmount, total };
  }, []);

  // Derive free-item rows when discount matches full unit prices (buy/get promos).
  const deriveFreeItemsFromDiscount = useCallback((order, discountAmount) => {
    const targetDiscount = roundTo2(discountAmount);
    if (!order?.items?.length || targetDiscount <= 0) {
      return { rows: [], isExact: false };
    }

    const units = [];
    for (const item of order.items) {
      const unitPrice = roundTo2(item.price);
      const qty = Math.max(0, Number(item.quantity) || 0);
      for (let i = 0; i < qty; i += 1) {
        units.push({
          notebookId: String(item.notebook?._id || item.notebook || ""),
          name: item.notebook?.name || "Notebook",
          unitPrice,
        });
      }
    }

    units.sort((a, b) => a.unitPrice - b.unitPrice);
    let remaining = targetDiscount;
    const taken = [];

    for (const unit of units) {
      if (remaining <= 0) break;
      // Allow tiny float tolerance.
      if (remaining + 0.005 >= unit.unitPrice) {
        taken.push(unit);
        remaining = roundTo2(remaining - unit.unitPrice);
      }
    }

    const grouped = new Map();
    for (const unit of taken) {
      const key = `${unit.notebookId}::${unit.unitPrice}`;
      const existing = grouped.get(key) || {
        notebookId: unit.notebookId,
        name: unit.name,
        freeQty: 0,
        unitPrice: unit.unitPrice,
        freeAmount: 0,
      };
      existing.freeQty += 1;
      existing.freeAmount = roundTo2(existing.freeAmount + unit.unitPrice);
      grouped.set(key, existing);
    }

    return {
      rows: Array.from(grouped.values()),
      isExact: remaining === 0,
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/orders");

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
      if (shipmentHistoryOrder?._id === res.data?._id) {
        setShipmentHistoryOrder(res.data);
      }
      if (paymentHistoryOrder?._id === res.data?._id) {
        setPaymentHistoryOrder(res.data);
      }
      await fetchOrders();
    } catch (err) {
      setCancelRefundError(err.response?.data?.message || err.message || "Failed to cancel order");
    } finally {
      setCancelRefundLoading(false);
    }
  };

  const refundOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm(`Cancel this order, cancel any active shipment, and refund ${formatPrice(selectedOrder.totalAmount)} to the customer via ZWITCH? This cannot be undone.`)) return;
    setCancelRefundLoading(true);
    setCancelRefundError("");
    try {
      const res = await api.post(`/admin/orders/${selectedOrder._id}/refund`);
      setSelectedOrder(res.data.order);
      if (shipmentHistoryOrder?._id === res.data.order?._id) {
        setShipmentHistoryOrder(res.data.order);
      }
      if (paymentHistoryOrder?._id === res.data.order?._id) {
        setPaymentHistoryOrder(res.data.order);
      }
      await fetchOrders();
    } catch (err) {
      setCancelRefundError(err.response?.data?.message || err.message || "Refund failed");
    } finally {
      setCancelRefundLoading(false);
    }
  };

  const getShipmentStatus = (order) => {
    const history = Array.isArray(order?.shiprocket?.history) ? order.shiprocket.history : [];
    const latestHistory = history.length ? history[history.length - 1] : null;
    const latestAction = String(latestHistory?.action || "").toLowerCase();
    const latestStatus = latestHistory?.status || null;

    // Pickup actions should override stale trackingStatus values from courier feed.
    if (latestAction === "pickup_cancelled") {
      return { label: "Pickup Cancelled", className: "bg-amber-900/60 text-amber-300", clickable: true };
    }
    if (latestAction === "pickup_requested") {
      return { label: "Pickup Requested", className: "bg-purple-900/60 text-purple-300", clickable: true };
    }
    if (latestAction === "pickup_cancel_failed") {
      return { label: latestStatus || "Pickup Cancel Failed", className: "bg-red-900/60 text-red-300", clickable: true };
    }

    const statusLabel =
      order?.shiprocket?.trackingStatus ||
      latestHistory?.status ||
      (order?.shiprocket?.awbCode ? "AWB assigned" : null) ||
      (order?.shiprocket?.orderId ? "Created" : null);

    if (!statusLabel) {
      return { label: "No shipment", className: "bg-gray-700 text-gray-400", clickable: false };
    }

    const normalized = String(statusLabel).toLowerCase();
    if (normalized.includes("delivered")) {
      return { label: statusLabel, className: "bg-green-900/60 text-green-300", clickable: true };
    }
    if (normalized.includes("cancel")) {
      return { label: statusLabel, className: "bg-red-900/60 text-red-300", clickable: true };
    }
    if (normalized.includes("created")) {
      return { label: statusLabel, className: "bg-blue-900/60 text-blue-300", clickable: true };
    }
    if (normalized.includes("awb")) {
      return { label: statusLabel, className: "bg-green-900/60 text-green-300", clickable: true };
    }
    if (normalized.includes("pickup")) {
      return { label: statusLabel, className: "bg-purple-900/60 text-purple-300", clickable: true };
    }
    return { label: statusLabel, className: "bg-cyan-900/60 text-cyan-300", clickable: true };
  };

  const getShipmentHistory = (order) =>
    [...(Array.isArray(order?.shiprocket?.history) ? order.shiprocket.history : [])]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  /** Shipments page only lists active shipments; hide deep link when none or shipment is cancelled. */
  const shouldShowShipmentHistoryShipmentsLink = (order) => {
    if (!order?.shiprocket?.orderId) return false;
    if (order.shiprocket?.active === false) return false;
    const history = Array.isArray(order?.shiprocket?.history) ? order.shiprocket.history : [];
    const sorted = [...history].sort((a, b) => new Date(b.at) - new Date(a.at));
    if (sorted[0]?.action === "shipment_cancelled") return false;
    const label = String(getShipmentStatus(order).label || "").toLowerCase();
    if (label.includes("cancel") && !label.includes("pickup")) return false;
    return true;
  };

  const formatShipmentAction = (action) =>
    String(action || "updated")
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const getPaymentStatus = (order) => {
    if (order?.payment?.refundedAt) {
      return { label: "REFUNDED", className: "bg-slate-800 text-slate-200", clickable: true };
    }

    const statusLabel = order?.payment?.paymentStatus || "PENDING";
    if (statusLabel === "SUCCESS") {
      return { label: "SUCCESS", className: "bg-green-900 text-green-300", clickable: true };
    }
    if (statusLabel === "FAILED") {
      return { label: "FAILED", className: "bg-red-900 text-red-300", clickable: true };
    }
    if (statusLabel === "CANCELLED") {
      return { label: "CANCELLED", className: "bg-red-950 text-red-300", clickable: true };
    }
    return { label: statusLabel, className: "bg-yellow-900 text-yellow-300", clickable: true };
  };

  const getPaymentHistory = (order) => {
    const history = [...(Array.isArray(order?.payment?.history) ? order.payment.history : [])];
    const hasAction = (matcher) => history.some((entry) => matcher(entry));

    if (order?.payment?.merchantOrderId && !hasAction((entry) => entry.action === "payment_initiated")) {
      history.push({
        action: "payment_initiated",
        status: order?.payment?.paymentStatus || "PENDING",
        message: "Payment was initiated for this order.",
        data: {
          amount: order?.payment?.amount ?? order?.totalAmount ?? null,
          merchantOrderId: order.payment.merchantOrderId,
        },
        at: order?.createdAt,
      });
    }

    if (
      order?.payment?.paymentStatus === "SUCCESS" &&
      !hasAction((entry) => entry.action === "payment_captured" || entry.status === "SUCCESS")
    ) {
      history.push({
        action: "payment_captured",
        status: "SUCCESS",
        message: "Payment was captured successfully.",
        data: {
          transactionId:
            order?.payment?.paymentTransactionId || order?.payment?.phonepeTransactionId || null,
        },
        at: order?.createdAt,
      });
    }

    if (
      (order?.payment?.paymentStatus === "FAILED" || order?.payment?.paymentStatus === "CANCELLED") &&
      !hasAction((entry) => entry.status === "FAILED" || entry.action === "payment_failed")
    ) {
      history.push({
        action:
          order?.payment?.paymentStatus === "CANCELLED" ? "payment_cancelled" : "payment_failed",
        status: order?.payment?.paymentStatus,
        message:
          order?.payment?.paymentStatus === "CANCELLED"
            ? "Payment was cancelled."
            : "Payment failed.",
        at: order?.createdAt,
      });
    }

    if (
      order?.payment?.refundedAt &&
      !hasAction((entry) => String(entry.action || "").includes("refund"))
    ) {
      history.push({
        action: "refund_initiated",
        status: "REFUNDED",
        message: "Refund was initiated for this payment.",
        data: {
          transactionId:
            order?.payment?.paymentTransactionId || order?.payment?.phonepeTransactionId || null,
        },
        at: order.payment.refundedAt,
      });
    }

    return history.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  };

  const formatPaymentAction = (action) =>
    String(action || "updated")
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const getPaymentMethodLabel = (method, paymentStatus) => {
    if (!method) {
      return paymentStatus === "SUCCESS" ? "Online" : "—";
    }
    const m = String(method).toLowerCase();
    if (m === "upi") return "UPI";
    if (m === "netbanking" || m === "net_banking") return "Net banking";
    if (m === "card" || m === "credit_card" || m === "debit_card") return "Card";
    return method;
  };

  const getPromoCodeUsedLabel = (order) => {
    const promo = order?.promoCode;
    if (!promo) return "—";
    if (typeof promo === "string") return promo;
    return promo.code || promo._id || "—";
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

  const updatePaymentStatusManually = async () => {
    if (!paymentHistoryOrder) return;
    setManualPaymentStatusLoading(true);
    setManualPaymentStatusError("");
    try {
      let updated = null;
      try {
        const res = await api.patch(`/admin/orders/${paymentHistoryOrder._id}/payment-status`, {
          paymentStatus: manualPaymentStatus,
        });
        updated = res.data;
      } catch (err) {
        if (err.response?.status !== 404) throw err;
        // Fallback for deployments where PATCH route is unavailable.
        const res = await api.post(`/admin/orders/${paymentHistoryOrder._id}/payment-status`, {
          paymentStatus: manualPaymentStatus,
        });
        updated = res.data;
      }
      setPaymentHistoryOrder(updated);
      if (selectedOrder?._id === updated._id) setSelectedOrder(updated);
      if (shipmentHistoryOrder?._id === updated._id) setShipmentHistoryOrder(updated);
      await fetchOrders();
    } catch (err) {
      setManualPaymentStatusError(
        err.response?.data?.message || err.message || "Failed to update payment status"
      );
    } finally {
      setManualPaymentStatusLoading(false);
    }
  };

  const refreshPaymentStatusFromGateway = async () => {
    if (!paymentHistoryOrder) return;
    setRefreshPaymentLoading(true);
    setRefreshPaymentMessage("");
    setManualPaymentStatusError("");
    try {
      const res = await api.post(
        `/admin/orders/${paymentHistoryOrder._id}/payment-status/refresh`
      );
      const updated = res.data?.order;
      if (!updated) throw new Error("Updated order data not returned");
      setPaymentHistoryOrder(updated);
      if (selectedOrder?._id === updated._id) setSelectedOrder(updated);
      if (shipmentHistoryOrder?._id === updated._id) setShipmentHistoryOrder(updated);
      await fetchOrders();
      setRefreshPaymentMessage(
        `Refreshed: ${res.data?.previousStatus || "—"} -> ${res.data?.currentStatus || "—"}`
      );
    } catch (err) {
      setManualPaymentStatusError(
        err.response?.data?.message || err.message || "Failed to refresh payment status"
      );
    } finally {
      setRefreshPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (!paymentHistoryOrder) return;
    setManualPaymentStatus(paymentHistoryOrder.payment?.paymentStatus || "PENDING");
    setManualPaymentStatusError("");
    setRefreshPaymentMessage("");
  }, [paymentHistoryOrder]);

  const selectedOrderBreakdown = selectedOrder ? computeOrderBreakdown(selectedOrder) : null;
  const selectedOrderFreeItems = selectedOrderBreakdown
    ? deriveFreeItemsFromDiscount(selectedOrder, selectedOrderBreakdown.discountAmount)
    : { rows: [], isExact: false };

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
                  <div className="bg-blue-900/30 border border-blue-700 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                    Live MongoDB
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
                          {(() => {
                            const p = getPaymentStatus(order);
                            return (
                              <button
                                type="button"
                                onClick={() => setPaymentHistoryOrder(order)}
                                className={`px-2 py-1 text-xs font-semibold rounded-full hover:opacity-90 ${p.className}`}
                                title="View payment history"
                              >
                                {p.label}
                              </button>
                            );
                          })()}
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
                              s.clickable ? (
                                <button
                                  type="button"
                                  onClick={() => setShipmentHistoryOrder(order)}
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${s.className} hover:opacity-90`}
                                  title={order.shiprocket?.awbCode ? `AWB: ${order.shiprocket.awbCode}` : "View shipment history"}
                                >
                                  {s.label}
                                </button>
                              ) : (
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.className}`}>
                                  {s.label}
                                </span>
                              )
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
                    <p className="text-gray-400 text-sm">Promo Code Used</p>
                    <p className="text-white">
                      {getPromoCodeUsedLabel(selectedOrder)}
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
                    {(() => {
                      const p = getPaymentStatus(selectedOrder);
                      return (
                        <button
                          type="button"
                          onClick={() => setPaymentHistoryOrder(selectedOrder)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full inline-block mt-1 hover:opacity-90 ${p.className}`}
                        >
                          {p.label}
                        </button>
                      );
                    })()}
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
                        <span className="text-gray-400">Mode of payment:</span>{" "}
                        {getPaymentMethodLabel(selectedOrder.payment.paymentMethod, selectedOrder.payment?.paymentStatus)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPaymentHistoryOrder(selectedOrder)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View payment history
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.shipping && (
                  <div>
                    <p className="text-gray-400 text-sm mb-3">Shipping selection at checkout</p>
                    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                      <p className="text-white text-sm">
                        <span className="text-gray-400">Preferred courier:</span>{" "}
                        {selectedOrder.shipping.courierName ||
                          (selectedOrder.shipping.courierCompanyId
                            ? `Courier #${selectedOrder.shipping.courierCompanyId}`
                            : "Auto-select")}
                      </p>
                      <p className="text-white text-sm">
                        <span className="text-gray-400">Quoted shipping charge:</span>{" "}
                        {selectedOrder.shipping.charge != null
                          ? formatPrice(selectedOrder.shipping.charge)
                          : "—"}
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

                {/* Cancel order (refund disabled) */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Cancel order</p>
                  {cancelRefundError && (
                    <p className="text-red-400 text-sm mb-2">{cancelRefundError}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status !== "cancelled" ? (
                      <button
                        type="button"
                        onClick={cancelOrder}
                        disabled={cancelRefundLoading}
                        className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        {cancelRefundLoading ? "..." : "Cancel order"}
                      </button>
                    ) : null}
                    {selectedOrder.payment?.refundedAt && (
                      <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-400">
                        Refunded on {new Date(selectedOrder.payment.refundedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cancel order and any active Shiprocket shipment. Refund is not initiated from here.
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-3">Items</p>
                  <div className="space-y-2">
                    {(() => {
                      const freeByNotebookId = Object.fromEntries(
                        (selectedOrderFreeItems?.isExact ? selectedOrderFreeItems.rows : []).map((row) => [
                          String(row.notebookId),
                          {
                            freeQty: Number(row.freeQty) || 0,
                            freeAmount: Number(row.freeAmount) || 0,
                          },
                        ])
                      );

                      return selectedOrder.items.map((item, index) => {
                        const notebookId = String(item.notebook?._id || item.notebook || "");
                        const lineTotal = roundTo2((Number(item.price) || 0) * (Number(item.quantity) || 0));
                        const freeAmount = roundTo2(freeByNotebookId[notebookId]?.freeAmount || 0);
                        const freeQty = Number(freeByNotebookId[notebookId]?.freeQty || 0);
                        const netLine = roundTo2(Math.max(0, lineTotal - freeAmount));

                        return (
                          <div
                            key={index}
                            className="bg-gray-700 rounded-lg p-4 flex justify-between"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {item.notebook?.name || "Notebook"}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Quantity: {item.quantity} × {formatPrice(item.price)}
                              </p>
                              {freeQty > 0 && (
                                <p className="text-xs text-green-400 mt-1">
                                  {freeQty} item(s) free
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-blue-400 font-semibold">
                                {formatPrice(netLine)}
                              </p>
                              {freeAmount > 0 && (
                                <p className="text-xs text-gray-500 line-through">
                                  {formatPrice(lineTotal)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {selectedOrderBreakdown && (
                  <div>
                    <p className="text-gray-400 text-sm mb-3">Order Summary</p>
                    <div className="bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>
                          Subtotal {selectedOrderBreakdown.discountAmount > 0 ? "(after discount)" : ""}
                        </span>
                        <span className="text-white">{formatPrice(selectedOrderBreakdown.discountedSubtotal)}</span>
                      </div>
                      {selectedOrderBreakdown.discountAmount > 0 && (
                        <>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Promo code used</span>
                            <span className="text-white">{getPromoCodeUsedLabel(selectedOrder)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Original subtotal</span>
                            <span className="line-through">{formatPrice(selectedOrderBreakdown.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-green-400">
                            <span>You saved</span>
                            <span>{formatPrice(selectedOrderBreakdown.discountAmount)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-gray-300">
                        <span>Shipping</span>
                        <span className="text-white">{formatPrice(selectedOrderBreakdown.shippingCharge)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>GST</span>
                        <span className="text-white">{formatPrice(selectedOrderBreakdown.gstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-600">
                        <span className="text-white">Total</span>
                        <span className="text-blue-400">{formatPrice(selectedOrderBreakdown.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrderFreeItems.isExact && selectedOrderFreeItems.rows.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-3">Free Items (from promo discount)</p>
                    <div className="space-y-2">
                      {selectedOrderFreeItems.rows.map((row, idx) => (
                        <div
                          key={`${row.notebookId}-${idx}`}
                          className="bg-green-900/20 border border-green-800/60 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">{row.name}</p>
                            <p className="text-xs text-green-300">
                              {row.freeQty} free × {formatPrice(row.unitPrice)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-green-300">
                            −{formatPrice(row.freeAmount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      {selectedOrder.shiprocket?.orderId && selectedOrder.shiprocket?.active !== false ? (
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
                      ) : selectedOrder.shiprocket?.history?.length ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShipmentStatus(selectedOrder).className}`}>
                              Shipment: {getShipmentStatus(selectedOrder).label}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShipmentHistoryOrder(selectedOrder)}
                              className="text-sm text-blue-400 hover:text-blue-300"
                            >
                              View shipment history
                            </button>
                          </div>
                          {selectedOrder.status === "cancelled" || selectedOrder.payment?.refundedAt ? (
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
                                Previous shipment is preserved in history. Create a new shipment to continue fulfilment.
                              </p>
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

        {paymentHistoryOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Payment History</h2>
                  <p className="text-sm text-gray-400 mt-1 font-mono">
                    {paymentHistoryOrder._id}
                  </p>
                </div>
                <button
                  onClick={() => setPaymentHistoryOrder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <p className="text-gray-300 text-sm font-medium mb-3">
                    Manual Payment Status Sync
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={refreshPaymentStatusFromGateway}
                      disabled={refreshPaymentLoading}
                      className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      {refreshPaymentLoading ? "Refreshing..." : "Refresh Payment Status"}
                    </button>
                    <select
                      value={manualPaymentStatus}
                      onChange={(e) => setManualPaymentStatus(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="FAILED">FAILED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button
                      type="button"
                      onClick={updatePaymentStatusManually}
                      disabled={
                        manualPaymentStatusLoading ||
                        manualPaymentStatus === (paymentHistoryOrder.payment?.paymentStatus || "PENDING")
                      }
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      {manualPaymentStatusLoading ? "Updating..." : "Update payment status"}
                    </button>
                  </div>
                  {manualPaymentStatusError && (
                    <p className="text-red-400 text-xs mt-2">{manualPaymentStatusError}</p>
                  )}
                  {refreshPaymentMessage && (
                    <p className="text-green-400 text-xs mt-2">{refreshPaymentMessage}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    Use only when gateway dashboard and site status are out of sync.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Current payment status</p>
                    <p className="text-white">{getPaymentStatus(paymentHistoryOrder).label}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Mode of payment</p>
                    <p className="text-white">{getPaymentMethodLabel(paymentHistoryOrder.payment?.paymentMethod, paymentHistoryOrder.payment?.paymentStatus)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Merchant Order ID</p>
                    <p className="text-white font-mono">{paymentHistoryOrder.payment?.merchantOrderId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Transaction ID</p>
                    <p className="text-white font-mono">
                      {paymentHistoryOrder.payment?.paymentTransactionId ||
                        paymentHistoryOrder.payment?.phonepeTransactionId ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="text-white">{formatPrice(paymentHistoryOrder.payment?.amount || paymentHistoryOrder.totalAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Refunded At</p>
                    <p className="text-white">
                      {paymentHistoryOrder.payment?.refundedAt
                        ? new Date(paymentHistoryOrder.payment.refundedAt).toLocaleString("en-IN")
                        : "—"}
                    </p>
                  </div>
                </div>

                {getPaymentHistory(paymentHistoryOrder).length === 0 ? (
                  <p className="text-gray-400 text-sm">No payment history has been recorded for this order yet.</p>
                ) : (
                  <div className="space-y-3">
                    {getPaymentHistory(paymentHistoryOrder).map((entry, index) => (
                      <div
                        key={`${entry.action}-${entry.at}-${index}`}
                        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-white font-medium">{formatPaymentAction(entry.action)}</span>
                            {entry.status && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-600">
                                {entry.status}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {entry.at ? new Date(entry.at).toLocaleString("en-IN") : "—"}
                          </span>
                        </div>
                        {entry.message && (
                          <p className="text-sm text-gray-300 mt-2">{entry.message}</p>
                        )}
                        {entry.data && (
                          <pre className="mt-3 text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap bg-gray-800 rounded-lg p-3">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {shipmentHistoryOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Shipment History</h2>
                  <p className="text-sm text-gray-400 mt-1 font-mono">
                    {shipmentHistoryOrder._id}
                  </p>
                  {shouldShowShipmentHistoryShipmentsLink(shipmentHistoryOrder) && (
                    <Link
                      href={`/ijack/admin/shipments?orderId=${shipmentHistoryOrder._id}`}
                      className="inline-block mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      Open in Shipments
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => setShipmentHistoryOrder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Current shipment status</p>
                    <p className="text-white">{getShipmentStatus(shipmentHistoryOrder).label}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">AWB</p>
                    <p className="text-white font-mono">{shipmentHistoryOrder.shiprocket?.awbCode || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">SR Order ID</p>
                    <p className="text-white">{shipmentHistoryOrder.shiprocket?.orderId ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Shipment ID</p>
                    <p className="text-white">{shipmentHistoryOrder.shiprocket?.shipmentId ?? "—"}</p>
                  </div>
                </div>

                {getShipmentHistory(shipmentHistoryOrder).length === 0 ? (
                  <p className="text-gray-400 text-sm">No shipment history has been recorded for this order yet.</p>
                ) : (
                  <div className="space-y-3">
                    {getShipmentHistory(shipmentHistoryOrder).map((entry, index) => (
                      <div
                        key={`${entry.action}-${entry.at}-${index}`}
                        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-white font-medium">{formatShipmentAction(entry.action)}</span>
                            {entry.status && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-600">
                                {entry.status}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {entry.at ? new Date(entry.at).toLocaleString("en-IN") : "—"}
                          </span>
                        </div>
                        {entry.message && (
                          <p className="text-sm text-gray-300 mt-2">{entry.message}</p>
                        )}
                        {entry.data && (
                          <pre className="mt-3 text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap bg-gray-800 rounded-lg p-3">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
