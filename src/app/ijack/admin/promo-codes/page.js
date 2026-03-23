"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import api from "../../../../lib/api";

const DEFAULT_BUY_GET_PROMOS = [
  { code: "BUY3GET1", buyQty: 3, getQty: 1 },
  { code: "BUY5GET2", buyQty: 5, getQty: 2 },
  { code: "BUY10GET5", buyQty: 10, getQty: 5 },
];
const PROTECTED_PROMO_CODES = new Set(DEFAULT_BUY_GET_PROMOS.map((p) => p.code));

export default function AdminPromoCodes() {
  const { admin } = useAdminAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    buyQty: "",
    getQty: "",
    minOrderAmount: "",
    validFrom: "",
    validUntil: "",
    maxUses: "",
  });
  const [seedingDefaults, setSeedingDefaults] = useState(false);
  const defaultsSeededRef = useRef(false);

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/promo-codes");
      setCodes(response.data);
    } catch (err) {
      setError("Failed to load promo codes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin) fetchCodes();
  }, [admin, fetchCodes]);

  const seedDefaultBuyGetPromos = useCallback(async () => {
    setSeedingDefaults(true);
    setMessage({ type: "", text: "" });
    try {
      const existing = new Set((codes || []).map((c) => String(c.code || "").toUpperCase()));
      for (const promo of DEFAULT_BUY_GET_PROMOS) {
        if (existing.has(promo.code)) continue;
        try {
          await api.post("/admin/promo-codes", {
            code: promo.code,
            type: "buy_x_get_y",
            buyQty: promo.buyQty,
            getQty: promo.getQty,
            value: 0,
            minOrderAmount: 0,
          });
        } catch (err) {
          const msg = String(err.response?.data?.message || "").toLowerCase();
          if (!msg.includes("already exists")) throw err;
        }
      }
      setMessage({ type: "success", text: "Default Buy X Get Y promo codes ensured." });
      await fetchCodes();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add default Buy X Get Y promo codes",
      });
    } finally {
      setSeedingDefaults(false);
    }
  }, [codes, fetchCodes]);

  useEffect(() => {
    if (!admin || loading || seedingDefaults || defaultsSeededRef.current) return;
    const existing = new Set((codes || []).map((c) => String(c.code || "").toUpperCase()));
    const hasAllDefaults = DEFAULT_BUY_GET_PROMOS.every((p) => existing.has(p.code));
    if (!hasAllDefaults) {
      defaultsSeededRef.current = true;
      seedDefaultBuyGetPromos();
    }
  }, [admin, loading, seedingDefaults, codes, seedDefaultBuyGetPromos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSubmitting(true);
    try {
      await api.post("/admin/promo-codes", {
        code: form.code.trim(),
        type: form.type,
        value: form.type === "buy_x_get_y" ? 0 : Number(form.value),
        buyQty: form.type === "buy_x_get_y" ? Number(form.buyQty) : undefined,
        getQty: form.type === "buy_x_get_y" ? Number(form.getQty) : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      });
      setMessage({ type: "success", text: "Promo code created successfully" });
      setForm({
        code: "",
        type: "percent",
        value: "",
        buyQty: "",
        getQty: "",
        minOrderAmount: "",
        validFrom: "",
        validUntil: "",
        maxUses: "",
      });
      fetchCodes();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create promo code",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await api.patch(`/admin/promo-codes/${id}`, { active: !currentActive });
      setMessage({ type: "success", text: currentActive ? "Code deactivated" : "Code activated" });
      fetchCodes();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed" });
    }
  };

  const handleDelete = async (id) => {
    const promo = codes.find((c) => c._id === id);
    const code = String(promo?.code || "").toUpperCase();
    if (PROTECTED_PROMO_CODES.has(code)) {
      setMessage({ type: "error", text: `${code} is protected and cannot be deleted.` });
      return;
    }
    if (!confirm("Delete this promo code? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/promo-codes/${id}`);
      setMessage({ type: "success", text: "Promo code deleted" });
      fetchCodes();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Delete failed" });
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayValue = (promo) => {
    if (promo.type === "buy_x_get_y") {
      return `Buy ${promo.buyQty || 0} Get ${promo.getQty || 0}`;
    }
    if (promo.type === "percent") return `${promo.value}%`;
    return `₹${Number(promo.value).toFixed(2)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading promo codes...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.type === "success"
                ? "bg-green-900 border border-green-700 text-green-200"
                : "bg-red-900 border border-red-700 text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Create form */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-white">Create promo code</h2>
            <button
              type="button"
              onClick={seedDefaultBuyGetPromos}
              disabled={seedingDefaults}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seedingDefaults ? "Adding..." : "Add Buy3Get1 / Buy5Get2 / Buy10Get5"}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20"
                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value,
                    value: e.target.value === "buy_x_get_y" ? "0" : f.value,
                  }))
                }
                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount (₹)</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Value {form.type === "buy_x_get_y" ? "(auto)" : `* ${form.type === "percent" ? "(0–100)" : "(₹)"}`}
              </label>
              <input
                type="number"
                min={form.type === "percent" ? 0 : 0}
                max={form.type === "percent" ? 100 : undefined}
                step={form.type === "percent" ? 1 : 0.01}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required={form.type !== "buy_x_get_y"}
                disabled={form.type === "buy_x_get_y"}
              />
            </div>
            {form.type === "buy_x_get_y" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Buy Qty *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.buyQty || ""}
                    onChange={(e) => setForm((f) => ({ ...f, buyQty: e.target.value }))}
                    className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Get Qty *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.getQty || ""}
                    onChange={(e) => setForm((f) => ({ ...f, getQty: e.target.value }))}
                    className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Min order (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                placeholder="Optional"
                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valid from</label>
              <input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valid until</label>
              <input
                type="datetime-local"
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Max uses</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="Unlimited"
                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">All promo codes</h2>
            <p className="text-gray-400 text-sm mt-1">Create and manage discount codes for checkout.</p>
          </div>
          {codes.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">No promo codes yet. Create one above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Min order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Valid from</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Valid until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Uses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {codes.map((promo) => (
                    <tr key={promo._id} className="bg-gray-800 hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-white">
                        {promo.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{promo.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{displayValue(promo)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {promo.minOrderAmount ? `₹${Number(promo.minOrderAmount).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(promo.validFrom)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(promo.validUntil)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {promo.usedCount ?? 0}
                        {promo.maxUses != null ? ` / ${promo.maxUses}` : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            promo.active ? "bg-green-900/50 text-green-300" : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {promo.active ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {PROTECTED_PROMO_CODES.has(String(promo.code || "").toUpperCase()) && (
                          <span className="inline-flex items-center px-2 py-0.5 mr-3 rounded text-xs font-medium bg-amber-900/40 text-amber-300 border border-amber-700/60">
                            Protected
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(promo._id, promo.active)}
                          className="text-blue-400 hover:text-blue-300 font-medium mr-3"
                        >
                          {promo.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(promo._id)}
                          disabled={PROTECTED_PROMO_CODES.has(String(promo.code || "").toUpperCase())}
                          className={`font-medium ${
                            PROTECTED_PROMO_CODES.has(String(promo.code || "").toUpperCase())
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-red-400 hover:text-red-300"
                          }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
