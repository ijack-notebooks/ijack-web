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
                You haven't placed any orders yet. Start exploring our high-quality notebooks!
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
              {orders.map((order) => (
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
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === "delivered" 
                            ? "bg-green-900/40 text-green-400 border border-green-800"
                            : order.status === "cancelled"
                            ? "bg-red-900/40 text-red-400 border border-red-800"
                            : "bg-blue-900/40 text-blue-400 border border-blue-800"
                        }`}>
                          {order.status}
                        </span>
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

                    <div className="border-t border-gray-700 mt-6 pt-6 flex justify-between items-center">
                      <div className="text-gray-400 text-sm">
                        Ordered by <span className="text-gray-300 font-medium">{order.contactDetails?.name}</span>
                      </div>
                      <div className="text-xl font-bold text-blue-400">
                        Total: {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
