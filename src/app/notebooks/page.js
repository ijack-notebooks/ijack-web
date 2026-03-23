"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import OfferCrawl from "../../components/OfferCrawl";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../contexts/CartContext";
import { formatPrice } from "../../lib/currency";

export default function Notebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const { cart, getTotalPrice, updateQuantity, removeFromCart } = useCart();
  const previousTotalItemsRef = useRef(0);
  const autoPreviewDoneRef = useRef(false);
  const autoRetractTimerRef = useRef(null);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [cart],
  );
  const hasCartItems = totalItems > 0;

  const stockCapForItem = (notebook) => {
    if (notebook?.stockQuantity != null && Number(notebook.stockQuantity) > 0) {
      return Number(notebook.stockQuantity);
    }
    return null;
  };

  const canIncreaseQty = (item) => {
    const q = Number(item.quantity) || 0;
    if (!item.notebook?.inStock) return false;
    const cap = stockCapForItem(item.notebook);
    return cap == null ? true : q < cap;
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  // Auto-preview once on first add, then keep retracted unless user opens it manually.
  useEffect(() => {
    const prev = previousTotalItemsRef.current;
    if (totalItems === 0) {
      if (autoRetractTimerRef.current) {
        clearTimeout(autoRetractTimerRef.current);
        autoRetractTimerRef.current = null;
      }
      setSummaryOpen(false);
      autoPreviewDoneRef.current = false;
    } else if (prev === 0 && totalItems > 0 && !autoPreviewDoneRef.current) {
      setSummaryOpen(true);
      autoPreviewDoneRef.current = true;
      if (autoRetractTimerRef.current) {
        clearTimeout(autoRetractTimerRef.current);
      }
      autoRetractTimerRef.current = setTimeout(() => {
        setSummaryOpen(false);
        autoRetractTimerRef.current = null;
      }, 3500);
    }
    previousTotalItemsRef.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    return () => {
      if (autoRetractTimerRef.current) {
        clearTimeout(autoRetractTimerRef.current);
      }
    };
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await api.get("/notebooks");
      setNotebooks(response.data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load notebooks";
      setError(`Failed to load notebooks: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <OfferCrawl />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading notebooks...</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <OfferCrawl />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-red-400 text-xl">{error}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <OfferCrawl />
      <main className="min-h-screen bg-gray-900 py-8 relative">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            hasCartItems && summaryOpen ? "xl:pr-100" : ""
          }`}
        >
          <h1 className="text-4xl font-bold text-white mb-8">Our Notebooks</h1>
          {notebooks.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              No notebooks available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notebooks.map((notebook) => (
                <ProductCard key={notebook._id} notebook={notebook} />
              ))}
            </div>
          )}
        </div>

        {hasCartItems && (
          <>
            {!summaryOpen && (
              <button
                type="button"
                onClick={() => setSummaryOpen(true)}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 shadow-lg transition-colors"
              >
                Extract Summary ({totalItems})
              </button>
            )}

            <aside
              className={`fixed right-0 top-32 bottom-6 z-30 w-[92vw] max-w-sm bg-gray-800/95 border border-gray-700 rounded-l-2xl shadow-2xl backdrop-blur-sm transition-transform duration-300 ${
                summaryOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {summaryOpen && (
                <button
                  type="button"
                  onClick={() => setSummaryOpen(false)}
                  className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 h-12 w-8 rounded-l-full border border-gray-600 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-colors"
                  aria-label="Retract summary"
                  title="Retract summary"
                >
                  <span className="text-lg leading-none">›</span>
                </button>
              )}
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white">
                    Order Summary
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {cart.map((item) => {
                    const qty = Number(item.quantity) || 0;
                    const cap = stockCapForItem(item.notebook);
                    return (
                      <div
                        key={item.notebookId}
                        className="rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {item.notebook.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatPrice(Number(item.notebook.price) || 0)} each
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.notebookId)}
                            className="shrink-0 h-7 w-7 rounded-md border border-red-500/40 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center text-sm"
                            aria-label="Remove item"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-md border border-gray-600 bg-gray-800/80 overflow-hidden">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.notebookId, qty - 1)
                              }
                              className="h-7 w-7 text-sm text-gray-200 hover:bg-gray-700"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="px-2 text-sm text-white font-semibold tabular-nums min-w-8 text-center">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.notebookId, qty + 1)
                              }
                              disabled={!canIncreaseQty(item)}
                              className="h-7 w-7 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-blue-300 whitespace-nowrap">
                            {formatPrice(
                              (Number(item.notebook.price) || 0) * qty,
                            )}
                          </p>
                        </div>
                        {cap != null && qty >= cap && (
                          <p className="text-[11px] text-amber-400/90 mt-1.5">
                            Max stock reached
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-700 px-5 py-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Items</span>
                    <span className="text-white">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span className="text-white">Subtotal</span>
                    <span className="text-blue-400">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </aside>
          </>
        )}
      </main>
    </>
  );
}
