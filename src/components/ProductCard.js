"use client";

import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "../lib/currency";

export default function ProductCard({ notebook }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isAdding || isAdded) return;

    setIsAdding(true);

    // Add to cart
    addToCart(notebook, 1);

    // Animation sequence
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 300);
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-700">
      <div className="h-64 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
        <span className="text-6xl">📓</span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          {notebook.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {notebook.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-400">
            {formatPrice(notebook.price)}
          </span>
          <span className="text-sm text-gray-500">{notebook.pages} pages</span>
        </div>
        <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
          <span>{notebook.category}</span>
          <span>{notebook.size}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={
            !notebook.inStock ||
            notebook.stockQuantity === 0 ||
            isAdding ||
            isAdded
          }
          className={`w-full font-medium py-2 px-4 rounded-lg transition-all duration-300 transform ${
            isAdded
              ? "bg-green-600 text-white scale-95"
              : isAdding
              ? "bg-blue-700 text-white scale-95 animate-pulse"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:scale-100"
          }`}
        >
          {notebook.inStock && notebook.stockQuantity > 0 ? (
            isAdded ? (
              <span className="flex items-center justify-center gap-2">
                <span>✓</span>
                <span>Added to Cart!</span>
              </span>
            ) : isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span>
                <span>Adding...</span>
              </span>
            ) : (
              "Add to Cart"
            )
          ) : (
            "Out of Stock"
          )}
        </button>
      </div>
    </div>
  );
}
