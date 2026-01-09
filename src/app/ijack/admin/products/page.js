"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import AdminNavbar from "../../../../components/AdminNavbar";
import api from "../../../../lib/api";
import { formatPrice } from "../../../../lib/currency";

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("/uploads")) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
      : "https://ijack-server.onrender.com";
    return `${baseUrl}${imagePath}`;
  }
  return imagePath;
};

export default function ProductsList() {
  const { admin } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    pages: "",
    size: "",
    stockQuantity: "",
    inStock: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (admin) {
      fetchProducts();
      fetchCategories();
    }
  }, [admin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notebooks");
      setProducts(response.data);
    } catch (error) {
      setError("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      // Sort categories alphabetically
      const sortedCategories = (response.data || []).sort((a, b) =>
        a.localeCompare(b)
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      // If categories endpoint doesn't exist yet, get categories from products
      try {
        const productsResponse = await api.get("/notebooks");
        const uniqueCategories = [
          ...new Set(productsResponse.data.map((p) => p.category)),
        ].sort((a, b) => a.localeCompare(b));
        setCategories(uniqueCategories);
      } catch (err) {
        setCategories([]);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("pages", formData.pages);
      formDataToSend.append("size", formData.size);
      formDataToSend.append("stockQuantity", formData.stockQuantity);
      formDataToSend.append("inStock", formData.inStock);

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      // Use axios with FormData (need to set Content-Type header)
      const token = localStorage.getItem("adminToken");
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://ijack-server.onrender.com/api";
      const response = await axios.post(
        `${API_URL}/admin/products`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Product created successfully!");
      setTimeout(() => setSuccess(""), 5000);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        pages: "",
        size: "",
        stockQuantity: "",
        inStock: true,
      });
      setImageFile(null);
      setImagePreview(null);
      setShowCreateForm(false);
      fetchProducts();
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create product");
      console.error(error);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await api.delete(`/admin/products/${productId}`);
      setSuccess("Product deleted successfully");
      setTimeout(() => setSuccess(""), 5000);
      fetchProducts();
    } catch (error) {
      setError("Failed to delete product");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </main>
    );
  }

  return (
    <>
      <AdminNavbar title="Products List" />
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
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              {showCreateForm ? "✕ Cancel" : "+ New Product"}
            </button>
            <button
              onClick={fetchProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Create Product Form */}
          {showCreateForm && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Create New Product
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        No categories available. Create categories in the
                        &quot;Type of Products&quot; page first.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pages *
                    </label>
                    <input
                      type="number"
                      name="pages"
                      value={formData.pages}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Size *
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g., 8.5 x 11 inches"
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-48 rounded-lg border border-gray-600 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">In Stock</label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        name: "",
                        description: "",
                        price: "",
                        category: "",
                        pages: "",
                        size: "",
                        stockQuantity: "",
                        inStock: true,
                      });
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Pages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No products found. Create your first product above.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const imageUrl = getImageUrl(product.image);

                      return (
                        <tr key={product._id} className="hover:bg-gray-750">
                          <td className="px-6 py-4">
                            {imageUrl ? (
                              <div className="relative w-16 h-16">
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-2xl">
                                📓
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {product.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-300">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-blue-400">
                              {formatPrice(product.price)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {product.pages}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {product.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {product.stockQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                product.inStock && product.stockQuantity > 0
                                  ? "bg-green-900 text-green-300"
                                  : "bg-red-900 text-red-300"
                              }`}
                            >
                              {product.inStock && product.stockQuantity > 0
                                ? "In Stock"
                                : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
