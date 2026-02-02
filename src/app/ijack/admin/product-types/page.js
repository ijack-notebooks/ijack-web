"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import api from "../../../../lib/api";
import { formatPrice } from "../../../../lib/currency";

export default function ProductTypes() {
  const { admin } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryStats, setCategoryStats] = useState({});
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newHsn, setNewHsn] = useState("");
  const [newGstPercentage, setNewGstPercentage] = useState("");
  const [success, setSuccess] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    hsn: "",
    gstPercentage: "",
  });

  useEffect(() => {
    if (admin) {
      fetchProducts();
      fetchCategories();
    }
  }, [admin]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      const data = response.data || [];
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) =>
        (a.name || a).localeCompare(b.name || b)
      );
      setCategories(sorted);
    } catch (error) {
      console.error("Failed to load categories:", error);
      try {
        const productsResponse = await api.get("/notebooks");
        const names = [
          ...new Set(productsResponse.data.map((p) => p.category)),
        ].sort((a, b) => a.localeCompare(b));
        setCategories(
          names.map((name) => ({ name, hsn: "", gstPercentage: 0 }))
        );
      } catch (err) {
        setCategories([]);
      }
    }
  };

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
      await api.post("/admin/categories", {
        name: newCategory.trim(),
        hsn: newHsn.trim(),
        gstPercentage: newGstPercentage === "" ? 0 : Number(newGstPercentage),
      });
      setSuccess(`Category "${newCategory}" created successfully!`);
      setNewCategory("");
      setNewHsn("");
      setNewGstPercentage("");
      setShowCreateCategory(false);
      fetchCategories();
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create category");
      console.error(error);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL products? This action cannot be undone."
      )
    ) {
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

  const categoryNames = categories.map((c) =>
    typeof c === "object" ? c.name : c
  );
  const allCategoryNames = [
    ...new Set([...categoryNames, ...Object.keys(categoryStats)]),
  ];
  const displayCategories = allCategoryNames.filter(
    (cat) => categoryNames.includes(cat) || categoryStats[cat]
  );

  const getCategoryInfo = (name) =>
    categories.find((c) => (typeof c === "object" ? c.name : c) === name) || {
      _id: null,
      name,
      description: "",
      hsn: "",
      gstPercentage: 0,
    };

  const startEditing = (info) => {
    if (!info._id) return;
    setEditingCategoryId(info._id);
    setEditForm({
      name: info.name || "",
      description: info.description ?? "",
      hsn: info.hsn ?? "",
      gstPercentage:
        info.gstPercentage != null ? String(info.gstPercentage) : "",
    });
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditForm({ name: "", description: "", hsn: "", gstPercentage: "" });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategoryId) return;
    if (!editForm.name.trim()) {
      setError("Category name cannot be empty");
      return;
    }
    try {
      setError("");
      setSuccess("");
      await api.patch(`/admin/categories/${editingCategoryId}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        hsn: editForm.hsn.trim(),
        gstPercentage:
          editForm.gstPercentage === "" ? 0 : Number(editForm.gstPercentage),
      });
      setSuccess(`Category "${editForm.name}" updated successfully!`);
      cancelEditing();
      fetchCategories();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
      console.error(err);
    }
  };

  return (
    <>
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
              <h3 className="text-xl font-bold text-white mb-4">
                Create New Category
              </h3>
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
                    Category will be available immediately for product creation.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      HSN Number
                    </label>
                    <input
                      type="text"
                      value={newHsn}
                      onChange={(e) => setNewHsn(e.target.value)}
                      placeholder="e.g., 4820"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Harmonized System of Nomenclature code for GST
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GST %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={newGstPercentage}
                      onChange={(e) => setNewGstPercentage(e.target.value)}
                      placeholder="e.g., 18"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      GST percentage (0–100)
                    </p>
                  </div>
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
                      setNewHsn("");
                      setNewGstPercentage("");
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
          {displayCategories.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
              <p className="text-gray-400 text-lg mb-4">No categories found</p>
              <p className="text-gray-500 text-sm">
                Create a new category to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayCategories.map((categoryName) => {
                const info = getCategoryInfo(categoryName);
                const isEditing = info._id && editingCategoryId === info._id;
                return (
                  <div
                    key={categoryName}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                  >
                    {isEditing ? (
                      <form
                        onSubmit={handleUpdateCategory}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-bold text-white">
                          Edit Category
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                description: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              HSN
                            </label>
                            <input
                              type="text"
                              value={editForm.hsn}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  hsn: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              GST %
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={editForm.gstPercentage}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  gstPercentage: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white">
                            {categoryName}
                          </h3>
                          {info._id && (
                            <button
                              type="button"
                              onClick={() => startEditing(info)}
                              className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Products:</span>
                            <span className="text-white font-semibold">
                              {categoryStats[categoryName]?.count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Stock:</span>
                            <span className="text-white font-semibold">
                              {categoryStats[categoryName]?.totalStock || 0}{" "}
                              units
                            </span>
                          </div>
                          {(info.hsn || info.gstPercentage != null) && (
                            <>
                              {info.hsn && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">HSN:</span>
                                  <span className="text-white font-mono">
                                    {info.hsn}
                                  </span>
                                </div>
                              )}
                              {info.gstPercentage != null && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">GST:</span>
                                  <span className="text-white font-semibold">
                                    {Number(info.gstPercentage)}%
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Products by Category */}
          {displayCategories.length > 0 && (
            <div className="space-y-8">
              {displayCategories.map((categoryName) => {
                const categoryProducts = products.filter(
                  (p) => p.category === categoryName
                );
                return (
                  <div
                    key={categoryName}
                    className="bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="p-6 border-b border-gray-700">
                      <h2 className="text-2xl font-bold text-white">
                        {categoryName}
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">
                        {categoryProducts.length} product(s) in this category
                      </p>
                      {(getCategoryInfo(categoryName).hsn ||
                        getCategoryInfo(categoryName).gstPercentage !=
                          null) && (
                        <p className="text-gray-500 text-xs mt-1">
                          {getCategoryInfo(categoryName).hsn &&
                            `HSN: ${getCategoryInfo(categoryName).hsn}`}
                          {getCategoryInfo(categoryName).hsn &&
                            getCategoryInfo(categoryName).gstPercentage !=
                              null &&
                            " • "}
                          {getCategoryInfo(categoryName).gstPercentage !=
                            null &&
                            `GST: ${
                              getCategoryInfo(categoryName).gstPercentage
                            }%`}
                        </p>
                      )}
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
