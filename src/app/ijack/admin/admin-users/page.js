"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import api from "../../../../lib/api";

export default function AdminUsersPage() {
  const { admin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addByEmailLoading, setAddByEmailLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await api.get("/admin/admins");
      setAdmins(res.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Only super-admin can manage admin users.");
        setAdmins([]);
      } else {
        setError(err.response?.data?.message || "Failed to load admins");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push("/ijack/admin/login");
      return;
    }
    if (admin) {
      if (admin.role !== "super-admin") {
        setError("Only super-admin can manage admin users.");
        setLoading(false);
        return;
      }
      fetchAdmins();
    }
  }, [admin, authLoading, router, fetchAdmins]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!addUsername.trim() || !addPassword) {
      setError("Username and password are required.");
      return;
    }
    setAddLoading(true);
    try {
      await api.post("/admin/admins", {
        username: addUsername.trim(),
        password: addPassword,
      });
      setAddUsername("");
      setAddPassword("");
      await fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add admin");
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddByEmail = async (e) => {
    e.preventDefault();
    setError("");
    const email = addEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setAddByEmailLoading(true);
    try {
      await api.post("/admin/admins", { email });
      setAddEmail("");
      await fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add admin by email");
    } finally {
      setAddByEmailLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (id === admin?.id) return;
    setRemovingId(id);
    setError("");
    try {
      await api.delete(`/admin/admins/${id}`);
      await fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove admin");
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || (admin && admin.role !== "super-admin" && !error)) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  if (admin.role !== "super-admin") {
    return (
      <main className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-900/30 border border-amber-700 text-amber-200 px-4 py-3 rounded">
            Only super-admin can manage admin users.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Admin User</h2>
          <p className="text-gray-400">
            Add or remove secondary-admin users. Only super-admin (notebookijack@gmail.com) can manage this.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add admin (username + password)</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label htmlFor="new-username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    id="new-username"
                    type="text"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  They will sign in with username and password.
                </p>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "Add admin"}
                </button>
              </form>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add admin by email (Google login)</h3>
              <form onSubmit={handleAddByEmail} className="space-y-4">
                <div>
                  <label htmlFor="new-email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="new-email"
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. admin@example.com"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  They can sign in later using &quot;Login with Google&quot; on the admin login page with this email.
                </p>
                <button
                  type="submit"
                  disabled={addByEmailLoading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {addByEmailLoading ? "Adding..." : "Add by email"}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Admin users</h3>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : admins.length === 0 ? (
              <p className="text-gray-400">No admin users yet.</p>
            ) : (
              <ul className="space-y-3">
                {admins.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-4 py-2 border-b border-gray-700 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{a.username}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {a.email || "—"} · {a.role === "super-admin" ? "Super admin" : "Secondary admin"}
                      </p>
                    </div>
                    {a.role === "secondary-admin" && a.id !== admin?.id && (
                      <button
                        type="button"
                        onClick={() => handleRemove(a.id)}
                        disabled={removingId === a.id}
                        className="shrink-0 py-1.5 px-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded focus:outline-none disabled:opacity-50"
                      >
                        {removingId === a.id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
