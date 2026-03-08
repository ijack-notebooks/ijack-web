"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import { formatPrice } from "../../lib/currency";

// Shipping: Rs 26 per 500 grams
const SHIPPING_PER_500G = 26;

export default function Checkout() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (cart.length === 0) {
      router.push("/cart");
      return;
    }
  }, [user, authLoading, cart.length, router]);

  // Fetch category GST rates for checkout
  useEffect(() => {
    api.get("/notebooks/categories").then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
  }, []);

  // Update form data when user changes
  useEffect(() => {
    if (user && (!formData.name || !formData.email)) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.username || "",
        email: prev.email || user.email || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // GST % by category name
  const gstByCategory = useMemo(() => {
    return Object.fromEntries(
      (categories || []).map((c) => [c.name, Number(c.gstPercentage) || 0])
    );
  }, [categories]);

  // Order totals: subtotal, shipping (Rs 26 per 500g), GST by category, total
  const { subtotal, shippingCharge, gstAmount, total } = useMemo(() => {
    const sub = getTotalPrice();
    const totalWeightGrams = cart.reduce(
      (sum, item) => sum + (item.notebook?.weight ?? 0) * item.quantity,
      0
    );
    const shipping = Math.ceil(totalWeightGrams / 500) * SHIPPING_PER_500G;
    const gst = cart.reduce((sum, item) => {
      const itemTotal = (item.notebook?.price ?? 0) * item.quantity;
      const gstPct = gstByCategory[item.notebook?.category ?? ""] ?? 0;
      return sum + (itemTotal * gstPct) / 100;
    }, 0);
    return {
      subtotal: sub,
      shippingCharge: shipping,
      gstAmount: Math.round(gst),
      total: Math.round(sub + shipping + gst),
    };
  }, [cart, getTotalPrice, gstByCategory]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </main>
      </>
    );
  }

  // Don't render if user is not logged in or cart is empty
  if (!user || cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Redirecting...</div>
        </main>
      </>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          notebookId: item.notebookId,
          quantity: item.quantity,
        })),
        contactDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      // Initiate payment with PhonePe
      const paymentResponse = await api.post("/payment/initiate", orderData);

      if (paymentResponse.data.success && paymentResponse.data.paymentUrl) {
        // Store merchantOrderId for retrieval in callback
        if (paymentResponse.data.merchantOrderId) {
          sessionStorage.setItem("lastMerchantOrderId", paymentResponse.data.merchantOrderId);
        }
        // Redirect to PhonePe payment page
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        setError(paymentResponse.data.message || "Failed to initiate payment");
        setLoading(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Contact Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Delivery Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        required
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-xs">
                  By placing your order you agree to our{" "}
                  <Link href="/shipping" className="text-blue-400 hover:underline">Shipping Policy</Link>,{" "}
                  <Link href="/return" className="text-blue-400 hover:underline">Return Policy</Link>,{" "}
                  <Link href="/refund" className="text-blue-400 hover:underline">Refund Policy</Link>,{" "}
                  <Link href="/terms" className="text-blue-400 hover:underline">Terms & Conditions</Link>, and{" "}
                  <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.notebookId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-400">
                        {item.notebook.name} x{item.quantity}
                      </span>
                      <span className="text-white">
                        {formatPrice(item.notebook.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping (Rs 26 per 500g)</span>
                    <span className="text-white">{formatPrice(shippingCharge)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>GST</span>
                    <span className="text-white">{formatPrice(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                    <span className="text-white">Total</span>
                    <span className="text-blue-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
