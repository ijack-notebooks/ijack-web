"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";
import api from "../../../../lib/api";

export default function AdminInvoices() {
  const { admin } = useAdminAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/invoices");
      setInvoices(response.data);
    } catch (err) {
      setError("Failed to load invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin) fetchInvoices();
  }, [admin, fetchInvoices]);

  const handleView = async (id) => {
    try {
      const res = await api.get(`/admin/invoices/${id}/view`);
      if (res.data?.url) window.open(res.data.url, "_blank");
      else setMessage({ type: "error", text: "Could not get invoice URL" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to open invoice" });
    }
  };

  const handleSend = async (id) => {
    setSendingId(id);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.post(`/admin/invoices/${id}/send`);
      setMessage({ type: "success", text: res.data?.message || "Invoice sent successfully" });
      fetchInvoices();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to send invoice" });
      fetchInvoices();
    } finally {
      setSendingId(null);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading invoices...</div>
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

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">All Invoices</h2>
            <p className="text-gray-400 text-sm mt-1">
              View PDF from Supabase or resend invoice to customer email.
            </p>
          </div>

          {invoices.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              No invoices yet. Invoices are created when a payment succeeds.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto pb-3">
                <table className="min-w-[1220px] w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Invoice No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Last email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Storage
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="bg-gray-800 hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {inv.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {inv.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {inv.customerEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(inv.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 min-w-[150px]">
                          {inv.lastEmailError ? (
                            <span
                              className="text-red-400"
                              title={inv.lastEmailError}
                            >
                              Failed
                            </span>
                          ) : inv.lastEmailSentAt ? (
                            <span className="text-green-400" title="Sent successfully">
                              Sent {formatDate(inv.lastEmailSentAt)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 min-w-[120px]">
                          {inv.pdfPath ? (
                            <span className="text-green-400" title={inv.pdfPath}>
                              Stored
                            </span>
                          ) : inv.lastStorageError ? (
                            <span
                              className="text-red-400"
                              title={inv.lastStorageError}
                            >
                              Failed
                            </span>
                          ) : (
                            "Pending"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm min-w-[120px]">
                          <button
                            type="button"
                            onClick={() => handleView(inv._id)}
                            className="text-blue-400 hover:text-blue-300 font-medium mr-4"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend(inv._id)}
                            disabled={sendingId === inv._id}
                            className="text-green-400 hover:text-green-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingId === inv._id ? "Sending…" : "Send"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 pb-4 text-xs text-gray-500">
                Scroll horizontally to view all invoice columns.
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
