"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import api from "../../../../lib/api";
import { formatPrice } from "../../../../lib/currency";

function ShipmentsContent() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shiprocketConfig, setShiprocketConfig] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierOptions, setCourierOptions] = useState([]);
  const [courierOptionsLoading, setCourierOptionsLoading] = useState(false);
  const [courierOptionsError, setCourierOptionsError] = useState("");
  const [selectedCourierOption, setSelectedCourierOption] = useState(null);
  const [customerCourierChoice, setCustomerCourierChoice] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReasonOption, setCancelReasonOption] = useState("pickup_delay");
  const [cancelReasonCustom, setCancelReasonCustom] = useState("");

  const CANCEL_REASON_OPTIONS = [
    { value: "pickup_delay", label: "Pickup delay" },
    { value: "customer_address_issue", label: "Customer address issue" },
    { value: "inventory_issue", label: "Inventory issue" },
    { value: "courier_unavailable", label: "Courier unavailable" },
    { value: "manual_entry", label: "Manual entry" },
  ];

  const getTrackingUrl = (order) => order?.shiprocket?.trackingUrl || null;
  const getCourierLabel = (order) =>
    order?.shiprocket?.courierName ||
    selectedCourierOption?.courierName ||
    order?.shipping?.courierName ||
    (order?.shipping?.courierCompanyId ? `Courier #${order.shipping.courierCompanyId}` : "—");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Use admin/orders (MongoDB) so we get full order schema including shiprocket
      const response = await api.get("/admin/orders");
      const all = response.data || [];
      const withShipment = all.filter((o) => o.shiprocket?.orderId && o.shiprocket?.active !== false);
      setOrders(withShipment);
      return withShipment;
    } catch (err) {
      setError("Failed to load shipments");
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!admin) return;
    fetchOrders();
  }, [admin, fetchOrders]);

  useEffect(() => {
    if (!admin) return undefined;
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [admin, fetchOrders]);

  useEffect(() => {
    if (!admin) return;
    api.get("/admin/shiprocket/config").then((r) => setShiprocketConfig(r.data)).catch(() => setShiprocketConfig({ configured: false }));
  }, [admin]);

  const deepLinkFetchForId = useRef(null);
  const prevOrderIdFromUrl = useRef(orderIdFromUrl);

  useEffect(() => {
    if (!orderIdFromUrl) return;
    const found = orders.find((o) => o._id === orderIdFromUrl);
    if (found) setSelectedOrder(found);
  }, [orderIdFromUrl, orders]);

  useEffect(() => {
    if (prevOrderIdFromUrl.current !== orderIdFromUrl) {
      deepLinkFetchForId.current = null;
      prevOrderIdFromUrl.current = orderIdFromUrl;
    }
  }, [orderIdFromUrl]);

  // Deep link: list only includes active shipments; load by id so history modal link still selects the row.
  useEffect(() => {
    if (!admin || !orderIdFromUrl || loading) return;
    const found = orders.find((o) => o._id === orderIdFromUrl);
    if (found) {
      deepLinkFetchForId.current = null;
      return;
    }
    if (deepLinkFetchForId.current === orderIdFromUrl) return;
    deepLinkFetchForId.current = orderIdFromUrl;

    let cancelled = false;
    api
      .get(`/admin/orders/${orderIdFromUrl}`)
      .then((res) => {
        if (cancelled) return;
        const o = res.data;
        if (!o?.shiprocket?.orderId) return;
        setSelectedOrder(o);
        setOrders((prev) => {
          if (prev.some((p) => p._id === o._id)) {
            return prev.map((p) => (p._id === o._id ? o : p));
          }
          return [o, ...prev];
        });
      })
      .catch(() => {
        deepLinkFetchForId.current = null;
      });

    return () => {
      cancelled = true;
    };
  }, [admin, orderIdFromUrl, loading, orders]);

  const assignAwb = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      const payload = {
        orderId: selectedOrder._id,
      };
      if (selectedCourierOption?.courierCompanyId) {
        payload.courierCompanyId = selectedCourierOption.courierCompanyId;
        payload.courierName = selectedCourierOption.courierName;
      }
      const res = await api.post("/admin/shiprocket/assign-awb", payload);
      setSelectedOrder(res.data.order);
      setCourierModalOpen(false);
      await fetchOrders();
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message || err.message || "Failed to assign AWB";
      const details = data?.details;
      if (details != null) {
        msg += typeof details === "string" ? ` — ${details}` : ` — ${details?.message || details?.error || JSON.stringify(details)}`;
      }
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const generateLabel = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.post("/admin/shiprocket/generate-label", { orderId: selectedOrder._id });
      setSelectedOrder(res.data.order);
      if (res.data.label_url) window.open(res.data.label_url, "_blank");
      await fetchOrders();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to generate label");
    } finally {
      setActionLoading(false);
    }
  };

  const PICKUP_ACTIONS = ["pickup_requested", "pickup_cancelled", "pickup_cancel_failed"];
  const isPickupRequested = (order) => {
    const history = Array.isArray(order?.shiprocket?.history) ? order.shiprocket.history : [];
    const pickupEntries = history.filter((e) => PICKUP_ACTIONS.includes(e.action));
    if (pickupEntries.length === 0) return false;
    const sorted = [...pickupEntries].sort((a, b) => new Date(b.at) - new Date(a.at));
    return sorted[0].action === "pickup_requested";
  };

  const requestPickup = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.post("/admin/shiprocket/generate-pickup", { orderId: selectedOrder._id });
      setActionError("");
      if (res.data?.order) setSelectedOrder(res.data.order);
      else await fetchOrders();
      alert("Pickup request submitted to Shiprocket.");
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to request pickup");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelPickup = async () => {
    if (!selectedOrder) return;
    if (!confirm("Cancel only the scheduled pickup? The shipment will remain active.")) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.post("/admin/shiprocket/cancel-pickup", { orderId: selectedOrder._id });
      setActionError("");
      if (res.data?.order) setSelectedOrder(res.data.order);
      else await fetchOrders();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to cancel pickup");
    } finally {
      setActionLoading(false);
    }
  };

  const openTrackingModal = async () => {
    const awb = selectedOrder?.shiprocket?.awbCode;
    if (!awb) {
      setActionError("Assign AWB first to get tracking.");
      return;
    }
    setTrackingModalOpen(true);
    setActionError("");
    setTrackingData(null);
    setActionLoading(true);
    try {
      const res = await api.get(`/admin/shiprocket/track/${awb}`);
      setTrackingData(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to fetch tracking");
    } finally {
      setActionLoading(false);
    }
  };

  const closeTrackingModal = () => {
    setTrackingModalOpen(false);
    setTrackingData(null);
    setActionError("");
  };

  const cancelShipment = async () => {
    if (!selectedOrder?.shiprocket?.orderId) return;
    const reason =
      cancelReasonOption === "manual_entry"
        ? cancelReasonCustom.trim()
        : (CANCEL_REASON_OPTIONS.find((opt) => opt.value === cancelReasonOption)?.label || "").trim();
    if (!reason) {
      setActionError("Please provide a shipment cancellation reason.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.post("/admin/shiprocket/cancel", {
        orderId: selectedOrder._id,
        cancellationReason: reason,
      });
      if (res.data?.warning) {
        alert(res.data.message);
      }
      setCancelModalOpen(false);
      setCancelReasonOption("pickup_delay");
      setCancelReasonCustom("");
      setSelectedOrder(null);
      setTrackingData(null);
      await fetchOrders();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to cancel shipment");
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelModal = () => {
    if (!selectedOrder?.shiprocket?.orderId) return;
    setCancelModalOpen(true);
    setCancelReasonOption("pickup_delay");
    setCancelReasonCustom("");
    setActionError("");
  };

  const openCourierModal = async () => {
    if (!selectedOrder || selectedOrder.shiprocket?.awbCode) return;
    setCourierModalOpen(true);
    setCourierOptions([]);
    setCourierOptionsError("");
    setCourierOptionsLoading(true);
    try {
      const res = await api.get(`/admin/shiprocket/courier-options/${selectedOrder._id}`);
      const options = Array.isArray(res.data?.options) ? res.data.options : [];
      const customerChoice = res.data?.customerChoice || {
        courierCompanyId: selectedOrder.shipping?.courierCompanyId || null,
        courierName: selectedOrder.shipping?.courierName || null,
      };
      setCourierOptions(options);
      setCustomerCourierChoice(customerChoice);
      setSelectedCourierOption((prev) => {
        if (prev?.courierCompanyId) {
          const keep = options.find((opt) => opt.courierCompanyId === prev.courierCompanyId);
          if (keep) return keep;
        }
        if (customerChoice?.courierCompanyId) {
          const customerOption = options.find((opt) => opt.courierCompanyId === Number(customerChoice.courierCompanyId));
          if (customerOption) return customerOption;
        }
        return options[0] || null;
      });
    } catch (err) {
      setCourierOptionsError(err.response?.data?.message || err.message || "Failed to load courier options");
    } finally {
      setCourierOptionsLoading(false);
    }
  };

  if (!admin) return null;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading shipments...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!shiprocketConfig?.configured && (
          <div className="bg-amber-900/30 border border-amber-700 text-amber-200 px-4 py-3 rounded mb-6">
            Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD or SHIPROCKET_TEST_MODE=true in server .env.
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Shipments</h2>
          {shiprocketConfig?.configured && (
            <span className={`px-2 py-1 text-xs font-semibold rounded ${shiprocketConfig?.testMode ? "bg-amber-600 text-amber-100" : "bg-green-700 text-green-100"}`}>
              {shiprocketConfig?.testMode ? "Test mode" : "Live"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of orders with shipment */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Orders with shipment</h3>
              <p className="text-sm text-gray-400">{orders.length} shipment(s)</p>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {orders.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  No shipments yet. Create a shipment from{" "}
                  <Link href="/ijack/admin/orders" className="text-blue-400 hover:underline">
                    All Orders
                  </Link>{" "}
                  (View order → Create Shipment).
                </div>
              ) : (
                orders.map((order) => (
                  <button
                    key={order._id}
                    onClick={() => {
                      setSelectedOrder(order);
                      router.replace(`/ijack/admin/shipments?orderId=${order._id}`, { scroll: false });
                      setTrackingData(null);
                      setTrackingModalOpen(false);
                      setCourierModalOpen(false);
                      setCourierOptions([]);
                      setCourierOptionsError("");
                      setSelectedCourierOption(null);
                      setCustomerCourierChoice(null);
                      setActionError("");
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                      selectedOrder?._id === order._id ? "bg-gray-700 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="text-sm font-mono text-white truncate">{order._id?.slice(0, 8)}...</div>
                    <div className="text-xs text-gray-400">
                      {order.user?.username || order.contactDetails?.name || "—"} • {order.shiprocket?.trackingStatus || (order.shiprocket?.awbCode ? "AWB assigned" : "Awaiting AWB")}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail: selected shipment */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedOrder ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center text-gray-400">
                Select an order from the list to view shipment details and perform actions.
              </div>
            ) : (
              <>
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Shipment details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Order ID</p>
                      <p className="text-white font-mono">{selectedOrder._id?.slice(0, 12)}...</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Customer</p>
                      <p className="text-white">{selectedOrder.user?.username || selectedOrder.contactDetails?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">SR Order ID</p>
                      <p className="text-white">{selectedOrder.shiprocket?.orderId ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Shipment ID</p>
                      <p className="text-white">{selectedOrder.shiprocket?.shipmentId ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">AWB</p>
                      <p className="text-white font-mono">{selectedOrder.shiprocket?.awbCode ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Courier</p>
                      {selectedOrder.shiprocket?.awbCode ? (
                        <p className="text-white">{getCourierLabel(selectedOrder)}</p>
                      ) : (
                        <button
                          type="button"
                          onClick={openCourierModal}
                          className="text-left text-blue-400 hover:text-blue-300 underline underline-offset-2"
                        >
                          {selectedCourierOption?.courierName || getCourierLabel(selectedOrder)} (change)
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400">Live status</p>
                      <p className="text-white">{selectedOrder.shiprocket?.trackingStatus ?? "Awaiting webhook update"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Package weight</p>
                      <p className="text-white">
                        {Number.isFinite(Number(selectedOrder.shipping?.weightKg))
                          ? `${Number(selectedOrder.shipping.weightKg).toFixed(3)} kg`
                          : "0.500 kg"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last webhook</p>
                      <p className="text-white">
                        {selectedOrder.shiprocket?.lastWebhookAt
                          ? new Date(selectedOrder.shiprocket.lastWebhookAt).toLocaleString("en-IN")
                          : "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Delivery address</p>
                      <p className="text-white">
                        {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipCode}, {selectedOrder.address?.country}
                      </p>
                    </div>
                    {getTrackingUrl(selectedOrder) ? (
                      <div className="col-span-2">
                        <p className="text-gray-400">Tracking URL</p>
                        <a
                          href={getTrackingUrl(selectedOrder)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline break-all"
                        >
                          {getTrackingUrl(selectedOrder)}
                        </a>
                      </div>
                    ) : selectedOrder.shiprocket?.awbCode ? (
                      <div className="col-span-2">
                        <p className="text-gray-400">Tracking URL</p>
                        <p className="text-sm text-gray-400">
                          Public tracking link will become available after the courier performs the first scan. Use
                          {" "}&quot;Live tracking&quot; for API status meanwhile.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                  {actionError && (
                    <p className="text-red-400 text-sm mb-3">{actionError}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {!selectedOrder.shiprocket?.awbCode && (
                      <button
                        onClick={assignAwb}
                        disabled={actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        {actionLoading ? "..." : "Assign AWB"}
                      </button>
                    )}
                    {selectedOrder.shiprocket?.awbCode && (
                      <>
                        <button
                          onClick={generateLabel}
                          disabled={actionLoading}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {actionLoading ? "..." : "Get Label"}
                        </button>
                        {isPickupRequested(selectedOrder) ? (
                          <button
                            onClick={cancelPickup}
                            disabled={actionLoading}
                            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            {actionLoading ? "..." : "Cancel Pickup"}
                          </button>
                        ) : (
                          <button
                            onClick={requestPickup}
                            disabled={actionLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            {actionLoading ? "..." : "Request Pickup"}
                          </button>
                        )}
                        <button
                          onClick={openTrackingModal}
                          disabled={actionLoading}
                          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {actionLoading ? "..." : "Live tracking"}
                        </button>
                      </>
                    )}
                    <button
                      onClick={openCancelModal}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {actionLoading ? "..." : "Cancel shipment"}
                    </button>
                  </div>
                  {!selectedOrder.shiprocket?.awbCode && selectedCourierOption && (
                    <p className="text-xs text-gray-400 mt-3">
                      Selected for AWB: {selectedCourierOption.courierName}
                      {Number.isFinite(Number(selectedCourierOption.rate))
                        ? ` · ${formatPrice(Number(selectedCourierOption.rate))}`
                        : ""}
                      {selectedCourierOption.etdDays ? ` · ETA ${selectedCourierOption.etdDays} day(s)` : ""}
                    </p>
                  )}
                  {selectedOrder.shiprocket?.labelUrl && (
                    <div className="mt-3">
                      <a
                        href={selectedOrder.shiprocket.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        Download shipping label
                      </a>
                    </div>
                  )}
                </div>

                {trackingModalOpen && selectedOrder && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                    onClick={(e) => e.target === e.currentTarget && closeTrackingModal()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="admin-tracking-modal-title"
                  >
                    <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h2 id="admin-tracking-modal-title" className="text-lg font-semibold text-white">
                          Live tracking — {selectedOrder.shiprocket?.awbCode || "—"}
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
                        {actionLoading && (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" />
                          </div>
                        )}
                        {!actionLoading && actionError && (
                          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                            {actionError}
                          </div>
                        )}
                        {!actionLoading && !actionError && trackingData && (() => {
                          const td = trackingData.tracking_data || trackingData;
                          const status = td?.status ?? td?.current_status ?? trackingData.current_status ?? selectedOrder?.shiprocket?.trackingStatus ?? "—";
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
                                <p className="text-gray-400 text-sm">No scan events yet. Updates appear after the courier scans the package.</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {courierModalOpen && selectedOrder && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                    onClick={(e) => e.target === e.currentTarget && setCourierModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="shipment-courier-modal-title"
                  >
                    <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h2 id="shipment-courier-modal-title" className="text-lg font-semibold text-white">
                          Choose courier before AWB assignment
                        </h2>
                        <button
                          type="button"
                          onClick={() => setCourierModalOpen(false)}
                          className="text-gray-400 hover:text-white p-1 rounded"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-4 overflow-y-auto space-y-4 flex-1">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm">
                          <p className="text-gray-400">Customer&apos;s courier choice</p>
                          <p className="text-white mt-1">
                            {customerCourierChoice?.courierName ||
                              (customerCourierChoice?.courierCompanyId
                                ? `Courier #${customerCourierChoice.courierCompanyId}`
                                : selectedOrder.shipping?.courierName ||
                                  (selectedOrder.shipping?.courierCompanyId
                                    ? `Courier #${selectedOrder.shipping.courierCompanyId}`
                                    : "No courier selected at checkout"))}
                          </p>
                        </div>

                        {courierOptionsLoading && (
                          <div className="text-gray-300 text-sm">Loading courier options...</div>
                        )}

                        {!courierOptionsLoading && courierOptionsError && (
                          <div className="bg-red-900/30 border border-red-700 text-red-200 px-3 py-2 rounded text-sm">
                            {courierOptionsError}
                          </div>
                        )}

                        {!courierOptionsLoading && !courierOptionsError && courierOptions.length === 0 && (
                          <p className="text-gray-400 text-sm">No courier options available for this shipment.</p>
                        )}

                        {!courierOptionsLoading && !courierOptionsError && courierOptions.length > 0 && (
                          <div className="space-y-2">
                            {courierOptions.map((opt) => {
                              const isSelected = selectedCourierOption?.courierCompanyId === opt.courierCompanyId;
                              const isCustomerChoice =
                                Number(customerCourierChoice?.courierCompanyId || 0) > 0 &&
                                Number(customerCourierChoice.courierCompanyId) === Number(opt.courierCompanyId);

                              return (
                                <button
                                  key={`${opt.courierCompanyId}-${opt.courierName}`}
                                  type="button"
                                  onClick={() => setSelectedCourierOption(opt)}
                                  className={`w-full text-left p-3 rounded-lg border transition ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-900/20"
                                      : "border-gray-700 bg-gray-900 hover:border-gray-500"
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <p className="text-white font-medium">{opt.courierName}</p>
                                      <p className="text-xs text-gray-400">
                                        {opt.etdDays ? `ETA ${opt.etdDays} day(s)` : "ETA unavailable"}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-white font-semibold">{formatPrice(Number(opt.rate) || 0)}</p>
                                      {isCustomerChoice && (
                                        <p className="text-xs text-emerald-300">Customer choice</p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCourierModalOpen(false)}
                          className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {cancelModalOpen && selectedOrder && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                    onClick={(e) => e.target === e.currentTarget && setCancelModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="shipment-cancel-modal-title"
                  >
                    <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h2 id="shipment-cancel-modal-title" className="text-lg font-semibold text-white">
                          Shipment cancellation
                        </h2>
                        <button
                          type="button"
                          onClick={() => setCancelModalOpen(false)}
                          className="text-gray-400 hover:text-white p-1 rounded"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-gray-300">
                          Select a cancellation reason. This will be recorded in shipment history. Cancelling shipment does not refund the customer or cancel the order.
                        </p>
                        <div>
                          <label htmlFor="cancel-reason-option" className="block text-sm text-gray-300 mb-1">
                            Reason
                          </label>
                          <select
                            id="cancel-reason-option"
                            value={cancelReasonOption}
                            onChange={(e) => setCancelReasonOption(e.target.value)}
                            className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            {CANCEL_REASON_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {cancelReasonOption === "manual_entry" && (
                          <div>
                            <label htmlFor="cancel-reason-custom" className="block text-sm text-gray-300 mb-1">
                              Manual reason
                            </label>
                            <input
                              id="cancel-reason-custom"
                              type="text"
                              maxLength={160}
                              value={cancelReasonCustom}
                              onChange={(e) => setCancelReasonCustom(e.target.value)}
                              placeholder="Enter cancellation reason"
                              className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCancelModalOpen(false)}
                          className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white"
                          disabled={actionLoading}
                        >
                          Keep shipment
                        </button>
                        <button
                          type="button"
                          onClick={cancelShipment}
                          disabled={actionLoading || (cancelReasonOption === "manual_entry" && !cancelReasonCustom.trim())}
                          className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
                        >
                          {actionLoading ? "Cancelling..." : "Confirm cancel shipment"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ShipmentsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    }>
      <ShipmentsContent />
    </Suspense>
  );
}
