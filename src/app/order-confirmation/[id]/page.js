"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import { formatPrice } from "../../../lib/currency";

export default function OrderConfirmation() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${params.id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-red-400 text-xl">Order not found</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Order Placed Successfully!
            </h1>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-8">
              <p className="text-xl text-blue-200 mb-3">
                Thank you for choosing Ijack Notebooks!
              </p>
              <p className="text-lg text-gray-300">
                Our representatives will contact you soon to confirm your order
                details.
              </p>
              <p className="text-lg text-gray-300 mt-2">
                Your order will be fulfilled and delivered to your address
                shortly.
              </p>
            </div>
            <p className="text-lg text-gray-400 mb-8">
              We appreciate your business and look forward to serving you!
            </p>

            <div className="bg-gray-700 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-white mb-4">
                Order Details
              </h2>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="font-semibold">Order ID:</span> {order._id}
                </p>
                <p>
                  <span className="font-semibold">Total Amount:</span>{" "}
                  <span className="text-blue-400 font-bold">
                    {formatPrice(order.totalAmount)}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span className="capitalize text-yellow-400">
                    {order.status}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-white mb-4">
                Items Ordered
              </h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-gray-300"
                  >
                    <span>
                      {item.notebook?.name || "Notebook"} x{item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-white mb-4">
                Delivery Address
              </h2>
              <div className="text-gray-300">
                <p>{order.address.street}</p>
                <p>
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.zipCode}
                </p>
                <p>{order.address.country}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/orders"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/notebooks"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Shop More
              </Link>
              <Link
                href="/"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
