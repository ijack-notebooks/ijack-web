"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
              Ijack Notebooks
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/notebooks"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Notebooks
            </Link>

            {user ? (
              <>
                <Link
                  href="/cart"
                  className="relative text-gray-300 hover:text-white transition-colors"
                >
                  Cart
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <span className="text-gray-400">Welcome, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

