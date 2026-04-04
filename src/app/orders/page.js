"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import { formatPrice } from "../../lib/currency";

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [invoiceLoadingByOrder, setInvoiceLoadingByOrder] = useState({});

  const getTrackingUrl = (order) => order?.shiprocket?.trackingUrl || null;

  const openTrackingModal = useCallback(async (order) => {
    if (!order?.shiprocket?.awbCode) return;
    setTrackingModalOrder(order);
    setTrackingData(null);
    setTrackingError("");
    setTrackingLoading(true);
    try {
      const res = await api.get(`/orders/${order._id}/tracking`);
      setTrackingData(res.data);
    } catch (err) {
      setTrackingError(err.response?.data?.message || err.message || "Failed to load tracking");
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const closeTrackingModal = useCallback(() => {
    setTrackingModalOrder(null);
    setTrackingData(null);
    setTrackingError("");
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchOrders();
  }, [user, authLoading, router, fetchOrders]);

  useEffect(() => {
    if (!user || authLoading) return undefined;
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [user, authLoading, fetchOrders]);

  const computeOrderSummary = useCallback((order) => {
    const subtotal = (order.items || []).reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );
    const discountAmount = Math.max(0, Number(order.discountAmount) || 0);
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingCharge = Math.max(0, Number(order.shipping?.charge) || 0);
    const total = Number(order.totalAmount) || 0;
    const gstAmount = Math.max(0, total - discountedSubtotal - shippingCharge);
    return { subtotal, discountAmount, discountedSubtotal, shippingCharge, gstAmount, total };
  }, []);

  const handleDownloadInvoice = useCallback(async (orderId) => {
    setInvoiceLoadingByOrder((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.get(`/orders/${orderId}/invoice`);
      const url = res.data?.url;
      if (!url) throw new Error("Invoice URL not available");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to download invoice");
    } finally {
      setInvoiceLoadingByOrder((prev) => ({ ...prev, [orderId]: false }));
    }
  }, []);

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 py-12">
          <div className="max-w-4xl mx-auto px-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
            <Link
              href="/notebooks"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Continue Shopping →
            </Link>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
              <p className="text-gray-400 mb-8">
                You haven&apos;t placed any orders yet. Start exploring our high-quality notebooks!
              </p>
              <Link
                href="/notebooks"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
              >
                Browse Notebooks
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const summary = computeOrderSummary(order);
                return (
                <div
                  key={order._id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Order ID</p>
                        <p className="text-white font-mono font-medium">{order._id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Date</p>
                        <p className="text-white font-medium">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Status</p>
                        {(() => {
                          const rawTrackingStatus = order.shiprocket?.trackingStatus || "";
                          const trackingIsCancelled = rawTrackingStatus.toLowerCase().includes("cancel");
                          const orderNotCancelled = order.status !== "cancelled";
                          const statusLabel =
                            trackingIsCancelled && orderNotCancelled
                              ? order.status
                              : rawTrackingStatus || order.status;
                          const normalizedStatus = String(statusLabel || "").toLowerCase();
                          const statusClassName = normalizedStatus.includes("delivered")
                            ? "bg-green-900/40 text-green-400 border border-green-800"
                            : normalizedStatus.includes("cancel")
                            ? "bg-red-900/40 text-red-400 border border-red-800"
                            : normalizedStatus.includes("shipped") ||
                                normalizedStatus.includes("transit") ||
                                normalizedStatus.includes("out for delivery")
                            ? "bg-cyan-900/40 text-cyan-400 border border-cyan-800"
                            : normalizedStatus.includes("processing") || normalizedStatus.includes("awb")
                            ? "bg-amber-900/40 text-amber-400 border border-amber-800"
                            : "bg-blue-900/40 text-blue-400 border border-blue-800";
                          return (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          statusClassName
                        }`}>
                          {statusLabel}
                        </span>
                          );
                        })()}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Payment</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.payment?.paymentStatus === "SUCCESS"
                            ? "bg-green-900/40 text-green-400 border border-green-800"
                            : "bg-yellow-900/40 text-yellow-400 border border-yellow-800"
                        }`}>
                          {order.payment?.paymentStatus || "PENDING"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                                📓
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {item.notebook?.name || "Notebook"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="text-white font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-700 mt-6 pt-6 grid md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                          <span>Subtotal {summary.discountAmount > 0 ? "(after discount)" : ""}</span>
                          <span className="text-white">{formatPrice(summary.discountedSubtotal)}</span>
                        </div>
                        {summary.discountAmount > 0 && (
                          <>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Original subtotal</span>
                              <span className="line-through">{formatPrice(summary.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-green-400">
                              <span>You saved</span>
                              <span>{formatPrice(summary.discountAmount)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-gray-400">
                          <span>Shipping</span>
                          <span className="text-white">{formatPrice(summary.shippingCharge)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>GST</span>
                          <span className="text-white">{formatPrice(summary.gstAmount)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-700">
                          <span className="text-white">Total</span>
                          <span className="text-blue-400">{formatPrice(summary.total)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-between">
                        <div className="text-gray-400 text-sm">
                          Ordered by <span className="text-gray-300 font-medium">{order.contactDetails?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {order.shiprocket?.awbCode && (
                            <button
                              type="button"
                              onClick={() => openTrackingModal(order)}
                              className="text-sm text-cyan-400 hover:text-cyan-300 font-medium underline"
                            >
                              View tracking
                            </button>
                          )}
                          {getTrackingUrl(order) && (
                            <a
                              href={getTrackingUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-400 hover:text-gray-300"
                            >
                              Open courier link
                            </a>
                          )}
                          {order.shiprocket?.awbCode && !getTrackingUrl(order) && (
                            <span className="text-sm text-gray-400">
                              Live tracking in modal; courier link after first scan.
                            </span>
                          )}
                          {order.payment?.paymentStatus === "SUCCESS" && (
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(order._id)}
                              disabled={Boolean(invoiceLoadingByOrder[order._id])}
                              className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              {invoiceLoadingByOrder[order._id] ? "Loading invoice..." : "Download Invoice"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}

          {/* Tracking details modal */}
          {trackingModalOrder && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
              onClick={(e) => e.target === e.currentTarget && closeTrackingModal()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tracking-modal-title"
            >
              <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h2 id="tracking-modal-title" className="text-lg font-semibold text-white">
                    Tracking — {trackingModalOrder.shiprocket?.awbCode || "—"}
                  </h2>
                  <button
                    type="button"
                    onClick={closeTrackingModal}
                    className="text-gray-400 hover:text-white p-1 rounded"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  {trackingLoading && (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" />
                    </div>
                  )}
                  {!trackingLoading && trackingError && (
                    <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                      {trackingError}
                    </div>
                  )}
                  {!trackingLoading && !trackingError && trackingData && (() => {
                    const td = trackingData.tracking_data || trackingData;
                    const status = td?.status ?? td?.current_status ?? trackingData.current_status ?? trackingModalOrder?.shiprocket?.trackingStatus ?? "—";
                    const edd = td?.edd ?? td?.delivered_date ?? (Array.isArray(td?.shipment_track) && td.shipment_track[0]?.delivered_date ? td.shipment_track[0].delivered_date : null);
                    const scans = Array.isArray(td?.scan) ? td.scan : Array.isArray(td?.shipment_track_activities) ? td.shipment_track_activities : [];
                    return (
                      <div className="space-y-4">
                        {trackingData.testMode && (
                          <p className="text-amber-400 text-sm">Test mode — sample data</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400 uppercase tracking-wider">Status</p>
                            <p className="text-white font-medium">{String(status)}</p>
                          </div>
                          {edd && (
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider">Expected delivery</p>
                              <p className="text-white font-medium">
                                {new Date(edd).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                              </p>
                            </div>
                          )}
                        </div>
                        {scans.length > 0 && (
                          <div>
                            <p className="text-gray-400 uppercase tracking-wider text-sm mb-2">Activity</p>
                            <ul className="space-y-2">
                              {scans.map((s, i) => (
                                <li key={i} className="flex gap-3 text-sm">
                                  <span className="text-gray-500 shrink-0">
                                    {s.date ? new Date(s.date).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}
                                  </span>
                                  <span className="text-gray-300">
                                    {s.activity ?? s.status ?? "—"}
                                    {s.location ? ` · ${s.location}` : ""}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {scans.length === 0 && !trackingData.testMode && (
                          <p className="text-gray-400 text-sm">No scan events yet. Updates appear after the courier scans your package.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
