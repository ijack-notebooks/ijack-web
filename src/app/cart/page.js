"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { formatPrice, formatPriceWithDecimals } from "../../lib/currency";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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

  // Don't render if user is not logged in
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Redirecting...</div>
        </main>
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400 text-xl mb-6">Your cart is empty</p>
              <Link
                href="/notebooks"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Browse Notebooks
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
          <div className="space-y-4 mb-8">
            {cart.map((item) => (
              <div
                key={item.notebookId}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.notebook.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    {item.notebook.description}
                  </p>
                  <p className="text-blue-400 font-semibold">
                    {formatPrice(item.notebook.price)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.notebookId, item.quantity - 1)
                      }
                      className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-white font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.notebookId, item.quantity + 1)
                      }
                      className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-white font-semibold w-24 text-right">
                    {formatPrice(item.notebook.price * item.quantity)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.notebookId)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold text-white">Total:</span>
              <span className="text-2xl font-bold text-blue-400">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
