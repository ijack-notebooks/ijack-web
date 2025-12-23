"use client";

import { useState, useEffect } from "react";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";

export default function Notebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotebooks();
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
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-red-400 text-xl">{error}</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </main>
    </>
  );
}
