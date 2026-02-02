"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // Use admin/orders (MongoDB) so we get full order schema including shiprocket
      const response = await api.get("/admin/orders");
      const all = response.data || [];
      const withShipment = all.filter((o) => o.shiprocket?.orderId);
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
    if (!admin) return;
    api.get("/admin/shiprocket/config").then((r) => setShiprocketConfig(r.data)).catch(() => setShiprocketConfig({ configured: false }));
  }, [admin]);

  useEffect(() => {
    if (!orderIdFromUrl || !orders.length) return;
    const found = orders.find((o) => o._id === orderIdFromUrl);
    if (found) setSelectedOrder(found);
  }, [orderIdFromUrl, orders]);

  const assignAwb = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.post("/admin/shiprocket/assign-awb", { orderId: selectedOrder._id });
      setSelectedOrder(res.data.order);
      await fetchOrders();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to assign AWB");
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

  const requestPickup = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");
    try {
      await api.post("/admin/shiprocket/generate-pickup", { orderId: selectedOrder._id });
      setActionError("");
      alert("Pickup request submitted to Shiprocket.");
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to request pickup");
    } finally {
      setActionLoading(false);
    }
  };

  const track = async () => {
    const awb = selectedOrder?.shiprocket?.awbCode;
    if (!awb) {
      setActionError("Assign AWB first to get tracking.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    setTrackingData(null);
    try {
      const res = await api.get(`/admin/shiprocket/track/${awb}`);
      setTrackingData(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to fetch tracking");
    } finally {
      setActionLoading(false);
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
          {shiprocketConfig?.testMode && (
            <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-600 text-amber-100">
              Test mode
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
                      setActionError("");
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                      selectedOrder?._id === order._id ? "bg-gray-700 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="text-sm font-mono text-white truncate">{order._id?.slice(0, 8)}...</div>
                    <div className="text-xs text-gray-400">
                      {order.user?.username || order.contactDetails?.name || "—"} • {order.shiprocket?.awbCode ? "AWB assigned" : "Awaiting AWB"}
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
                      <p className="text-white">{selectedOrder.shiprocket?.courierName ?? "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Delivery address</p>
                      <p className="text-white">
                        {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipCode}, {selectedOrder.address?.country}
                      </p>
                    </div>
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
                        <button
                          onClick={requestPickup}
                          disabled={actionLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {actionLoading ? "..." : "Request Pickup"}
                        </button>
                        <button
                          onClick={track}
                          disabled={actionLoading}
                          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {actionLoading ? "..." : "Track"}
                        </button>
                      </>
                    )}
                  </div>
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

                {trackingData && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Tracking</h3>
                    {trackingData.testMode && (
                      <p className="text-amber-400 text-sm mb-2">(Test mode – mock data)</p>
                    )}
                    <div className="bg-gray-900 rounded p-4 text-sm text-gray-300 overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(trackingData, null, 2)}</pre>
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
