"use client";

import { useState, useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "../lib/currency";

export default function ProductCard({ notebook }) {
  const { addToCart, updateQuantity, cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const cartItem = useMemo(
    () => cart.find((item) => String(item.notebookId) === String(notebook._id)),
    [cart, notebook._id]
  );
  const quantity = cartItem?.quantity ?? 0;

  /** Max units when stock is tracked; otherwise no cap on + */
  const stockCap =
    notebook.stockQuantity != null && Number(notebook.stockQuantity) > 0
      ? Number(notebook.stockQuantity)
      : null;
  const canIncrease =
    notebook.inStock && (stockCap == null ? true : quantity < stockCap);

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isAdding || isAdded || !canIncrease) return;

    setIsAdding(true);

    addToCart(notebook, 1);

    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 300);
  };

  const handleDecrease = () => {
    if (!user || quantity <= 0) return;
    updateQuantity(notebook._id, quantity - 1);
  };

  const handleIncrease = () => {
    if (!user || !canIncrease) return;
    if (quantity === 0) {
      addToCart(notebook, 1);
      return;
    }
    updateQuantity(notebook._id, quantity + 1);
  };

  // Get image URL - if it's a relative path, prepend the API base URL
  const getImageUrl = () => {
    if (!notebook.image) {
      return null;
    }
    // If it's already a full URL (Supabase or other), return as is
    if (notebook.image.startsWith("http://") || notebook.image.startsWith("https://")) {
      return notebook.image;
    }
    // If image starts with /uploads, it's a server path
    if (notebook.image.startsWith("/uploads")) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL 
        ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
        : "https://ijack-server-pbdb.onrender.com";
      return `${baseUrl}${notebook.image}`;
    }
    // Otherwise, return as is
    return notebook.image;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-700">
      <div className="h-64 bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={notebook.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = '<span class="text-6xl">📓</span>';
            }}
          />
        ) : (
          <span className="text-6xl">📓</span>
        )}
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
        {!user ? (
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full font-medium py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Login to add to cart
          </button>
        ) : !notebook.inStock || notebook.stockQuantity === 0 ? (
          <button
            type="button"
            disabled
            className="w-full font-medium py-2 px-4 rounded-lg bg-gray-600 text-gray-300 cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : quantity > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 text-center">In cart</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleDecrease}
                className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-white font-semibold min-w-8 text-center tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={!canIncrease}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            {stockCap != null && quantity >= stockCap && (
              <p className="text-xs text-amber-400/90 text-center">Max stock reached</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || isAdded || !canIncrease}
            className={`w-full font-medium py-2 px-4 rounded-lg transition-all duration-300 transform ${
              isAdded
                ? "bg-green-600 text-white scale-95"
                : isAdding
                  ? "bg-blue-700 text-white scale-95 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:scale-100"
            }`}
          >
            {isAdded ? (
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
            )}
          </button>
        )}
      </div>
    </div>
  );
}
