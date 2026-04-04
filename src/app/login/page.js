"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import api from "../../lib/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading: authLoading, login, checkAuth } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (idToken) => {
    setGoogleLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/google", { id_token: idToken });
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        await checkAuth();
        router.push("/notebooks");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (message) => {
    setError(message || "Google sign-in failed");
    setGoogleLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;

    // If user is already logged in, redirect to notebooks
    if (user) {
      router.push("/notebooks");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      router.push("/notebooks");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

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

  // Don't render login form if user is already logged in
  if (user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Redirecting...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <div>
            <h2 className="text-center text-3xl font-bold text-white">Sign in</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                create a new account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div>
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={googleLoading}
                loading={googleLoading}
              />
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

