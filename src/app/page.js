"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-800 via-gray-900 to-black py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to Ijack Notebooks
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover our premium collection of notebooks designed for every writing need.
              From classic spirals to elegant journals, find your perfect companion.
            </p>
            <Link
              href="/notebooks"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Why Choose Ijack Notebooks?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-white mb-2">Wide Variety</h3>
                <p className="text-gray-400">
                  Choose from spiral notebooks, journals, sketchbooks, and more.
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
                <p className="text-gray-400">
                  High-quality paper and durable bindings that last.
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-white mb-2">Fast Delivery</h3>
                <p className="text-gray-400">
                  Quick and secure shipping to your doorstep.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-gray-300 mb-8">
              Browse our collection and find the perfect notebook for you.
            </p>
            <Link
              href="/notebooks"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              View All Notebooks
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
