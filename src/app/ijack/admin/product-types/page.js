"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import AdminNavbar from "../../../../components/AdminNavbar";
import api from "../../../../lib/api";
import { formatPrice } from "../../../../lib/currency";

export default function ProductTypes() {
  const { admin } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryStats, setCategoryStats] = useState({});
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (admin) {
      fetchProducts();
    }
  }, [admin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notebooks");
      setProducts(response.data);

      // Calculate category statistics
      const stats = {};
      response.data.forEach((product) => {
        if (stats[product.category]) {
          stats[product.category].count += 1;
          stats[product.category].totalStock += product.stockQuantity;
        } else {
          stats[product.category] = {
            count: 1,
            totalStock: product.stockQuantity,
          };
        }
      });
      setCategoryStats(stats);
    } catch (error) {
      setError("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading product types...</div>
      </main>
    );
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      setError("");
      setSuccess("");
      // Category will be created when first product is added with this category
      setSuccess(`Category "${newCategory}" is ready. Add products to this category in the Products List page.`);
      setNewCategory("");
      setShowCreateCategory(false);
    } catch (error) {
      setError("Failed to create category");
      console.error(error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL products? This action cannot be undone.")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await api.delete("/admin/products");
      setSuccess("All products deleted successfully");
      setTimeout(() => setSuccess(""), 5000);
      fetchProducts();
    } catch (error) {
      setError("Failed to delete products");
      console.error(error);
    }
  };

  const categories = Object.keys(categoryStats);

  return (
    <>
      <AdminNavbar title="Type of Products" />
      <main className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateCategory(!showCreateCategory)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                {showCreateCategory ? "✕ Cancel" : "+ New Category"}
              </button>
              {products.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  🗑️ Delete All Products
                </button>
              )}
            </div>
            <button
              onClick={fetchProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Create Category Form */}
          {showCreateCategory && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Create New Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., Spiral, Journal, Sketchbook"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Note: Category will be created when you add the first product with this category name.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCategory(false);
                      setNewCategory("");
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Category Statistics */}
          {categories.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
              <p className="text-gray-400 text-lg mb-4">No categories found</p>
              <p className="text-gray-500 text-sm">Create a new category to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categories.map((category) => (
              <div
                key={category}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4">{category}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Products:</span>
                    <span className="text-white font-semibold">
                      {categoryStats[category].count}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Stock:</span>
                    <span className="text-white font-semibold">
                      {categoryStats[category].totalStock} units
                    </span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Products by Category */}
          {categories.length > 0 && (
            <div className="space-y-8">
              {categories.map((category) => {
              const categoryProducts = products.filter(
                (p) => p.category === category
              );
              return (
                <div
                  key={category}
                  className="bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">{category}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {categoryProducts.length} product(s) in this category
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryProducts.map((product) => (
                        <div
                          key={product._id}
                          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                        >
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-400 font-semibold">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-gray-400">
                              Stock: {product.stockQuantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

