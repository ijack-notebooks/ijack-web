"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import { formatPrice } from "../../lib/currency";

// Fallback shipping when live courier rates are unavailable.
const SHIPPING_PER_500G = 26;

export default function Checkout() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const normalizedDeliveryPincode = String(formData.zipCode || "").replace(/\D/g, "").slice(0, 6);
  const hasPincodeInput = normalizedDeliveryPincode.length > 0;

  const buildPromoValidationItems = useCallback(() => {
    return cart.map((item) => ({
      notebookId: item.notebookId,
      quantity: Number(item.quantity) || 0,
      price: Number(item.notebook?.price) || 0,
    }));
  }, [cart]);

  const loadLayerScript = useCallback((layerScriptUrl) => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("No window"));
        return;
      }
      if (window.Layer) {
        resolve();
        return;
      }
      const existing = document.querySelector(`script[src="${layerScriptUrl}"]`);
      if (existing) {
        const check = () => (window.Layer ? resolve() : setTimeout(check, 50));
        check();
        return;
      }
      const script = document.createElement("script");
      script.id = "context";
      script.type = "text/javascript";
      script.src = layerScriptUrl;
      script.onload = () => {
        const check = () => (window.Layer ? resolve() : setTimeout(check, 50));
        check();
      };
      script.onerror = () => reject(new Error("Failed to load payment gateway"));
      document.body.appendChild(script);
    });
  }, []);

  const extractLayerPaymentMethod = useCallback((response) => {
    const raw =
      response?.type_name ||
      response?.payment?.type_name ||
      response?.payment_instrument?.type_name ||
      response?.payment_instrument?.type ||
      response?.payment_method;
    if (!raw || typeof raw !== "string") return "";
    const t = raw.toLowerCase().trim().replace(/[-\s]+/g, "_");
    if (t.includes("net") && t.includes("bank")) return "netbanking";
    if (t.includes("card")) return "card";
    if (t.includes("upi")) return "upi";
    return raw;
  }, []);

  const openZwitchLayer = useCallback(
    (paymentToken, accessKey, merchantOrderId, layerScriptUrl) => {
      loadLayerScript(layerScriptUrl)
        .then(() => {
          if (!window.Layer) {
            setError("Payment gateway is still loading. Please try again.");
            setLoading(false);
            return;
          }
          window.Layer.checkout(
        {
          token: paymentToken,
          accesskey: accessKey,
          theme: {
            color: "#2563eb",
            error_color: "#ef4444",
          },
        },
        (response) => {
          if (response.status === "captured") {
            sessionStorage.setItem("lastMerchantOrderId", merchantOrderId);
            const paymentMethod = extractLayerPaymentMethod(response);
            if (paymentMethod) {
              sessionStorage.setItem("lastPaymentMethod", paymentMethod);
            } else {
              sessionStorage.removeItem("lastPaymentMethod");
            }
            router.push(
              `/payment/callback?merchantOrderId=${encodeURIComponent(merchantOrderId)}${
                paymentMethod ? `&paymentMethod=${encodeURIComponent(paymentMethod)}` : ""
              }`
            );
          } else if (response.status === "failed") {
            setError("Payment failed. You can try again.");
            setLoading(false);
          } else if (response.status === "cancelled") {
            setError("Payment was cancelled.");
            setLoading(false);
          }
        },
        (err) => {
          setError(err?.message || "Payment could not be opened. Please try again.");
          setLoading(false);
        }
      );
        })
        .catch((err) => {
          setError(err?.message || "Failed to load payment gateway.");
          setLoading(false);
        });
    },
    [router, loadLayerScript, extractLayerPaymentMethod]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (cart.length === 0) {
      router.push("/cart");
      return;
    }
  }, [user, authLoading, cart.length, router]);

  // Fetch category GST rates for checkout
  useEffect(() => {
    api.get("/notebooks/categories").then((res) => setCategories(res.data || [])).catch(() => setCategories([]));
  }, []);

  // Fetch available promo codes for display (same API as rest of app; retry once on failure)
  const fetchAvailablePromos = useCallback(async (retries = 2) => {
    try {
      const res = await api.get("/promo-codes/available");
      setAvailablePromos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchAvailablePromos(retries - 1), 800);
      } else {
        setAvailablePromos([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchAvailablePromos();
  }, [fetchAvailablePromos]);

  // Clear applied promo when cart changes so discount stays correct for current total
  const cartKey = cart.map((i) => `${i.notebookId}:${i.quantity}`).join(",");
  useEffect(() => {
    setAppliedPromo(null);
    setPromoError("");
  }, [cartKey]);

  useEffect(() => {
    const rawSubtotal = cart.reduce(
      (sum, item) => sum + (Number(item.notebook?.price) || 0) * (Number(item.quantity) || 0),
      0
    );
    // Shipment value for rate quotes should be after promo discount.
    const shipmentValue = Math.max(0, Math.round(rawSubtotal - (appliedPromo?.discountAmount || 0)));
    if (!user || cart.length === 0 || normalizedDeliveryPincode.length !== 6) {
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setShippingError("");
      return;
    }

    let active = true;
    setShippingLoading(true);
    setShippingError("");

    const shippingRequestBody = {
      items: cart.map((item) => ({
        notebookId: item.notebookId,
        quantity: item.quantity,
      })),
      deliveryPincode: normalizedDeliveryPincode,
      shipmentValue: Math.round(shipmentValue),
    };

    api
      .post("/payment/shipping-options", shippingRequestBody)
      .then((res) => {
        if (!active) return;
        const data = res.data || {};

        const options = Array.isArray(data?.options) ? data.options : [];
        setShippingOptions(options);
        if (!options.length) {
          setSelectedShippingOption(null);
          setShippingError("No courier options available for this pincode right now.");
          return;
        }
        setSelectedShippingOption((prev) => {
          if (!prev) return options[0];
          return (
            options.find((opt) => opt.courierCompanyId === prev.courierCompanyId) ||
            options[0]
          );
        });
      })
      .catch((err) => {
        if (!active) return;
        setShippingOptions([]);
        setSelectedShippingOption(null);
        setShippingError(
          err.response?.data?.message ||
            "Unable to fetch live shipping rates. Fallback shipping will be used."
        );
      })
      .finally(() => {
        if (active) setShippingLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cart, cartKey, normalizedDeliveryPincode, user, appliedPromo?.discountAmount]);

  // Update form data when user changes
  useEffect(() => {
    if (user && (!formData.name || !formData.email)) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.username || "",
        email: prev.email || user.email || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // GST % by category name
  const gstByCategory = useMemo(() => {
    return Object.fromEntries(
      (categories || []).map((c) => [c.name, Number(c.gstPercentage) || 0])
    );
  }, [categories]);

  // Order totals: discount first, then GST + shipping on discounted value.
  const {
    subtotal,
    discountedSubtotal,
    shippingCharge,
    fallbackShippingCharge,
    shippingIncluded,
    gstAmount,
    totalBeforeDiscount,
    total,
    discountAmount
  } = useMemo(() => {
    const sub = getTotalPrice();
    const totalWeightGrams = cart.reduce(
      (sum, item) => sum + (item.notebook?.weight ?? 0) * item.quantity,
      0
    );
    const fallbackShipping = Math.ceil(totalWeightGrams / 500) * SHIPPING_PER_500G;
    const computedShipping =
      selectedShippingOption && Number.isFinite(Number(selectedShippingOption.rate))
        ? Number(selectedShippingOption.rate)
        : fallbackShipping;
    const shipping = hasPincodeInput ? computedShipping : 0;
    const gstOnOriginalSubtotal = cart.reduce((sum, item) => {
      const itemTotal = (item.notebook?.price ?? 0) * item.quantity;
      const gstPct = gstByCategory[item.notebook?.category ?? ""] ?? 0;
      return sum + (itemTotal * gstPct) / 100;
    }, 0);
    const discount = appliedPromo?.discountAmount ?? 0;
    const discountedSub = Math.max(0, sub - discount);
    const discountRatio = sub > 0 ? discountedSub / sub : 1;
    const gst = gstOnOriginalSubtotal * discountRatio;
    const beforeDiscount = Math.round(discountedSub + shipping + gst);
    return {
      subtotal: sub,
      discountedSubtotal: discountedSub,
      shippingCharge: shipping,
      fallbackShippingCharge: fallbackShipping,
      shippingIncluded: hasPincodeInput,
      gstAmount: Math.round(gst),
      totalBeforeDiscount: beforeDiscount,
      discountAmount: discount,
      total: beforeDiscount,
    };
  }, [cart, getTotalPrice, gstByCategory, selectedShippingOption, appliedPromo?.discountAmount, hasPincodeInput]);

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

  // Don't render if user is not logged in or cart is empty
  if (!user || cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Redirecting...</div>
        </main>
      </>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a promo code");
      return;
    }
    setPromoError("");
    setPromoLoading(true);
    try {
      const res = await api.post("/promo-codes/validate", {
        code,
        amount: subtotal,
        items: buildPromoValidationItems(),
      });
      const data = res.data;
      if (data.valid) {
        setAppliedPromo({
          code: data.code,
          type: data.type,
          buyQty: data.buyQty,
          getQty: data.getQty,
          discountAmount: data.discountAmount,
          freeUnits: data.freeUnits || 0,
          freeBreakdown: Array.isArray(data.freeBreakdown) ? data.freeBreakdown : [],
          message: data.message,
        });
        setPromoInput("");
      } else {
        setPromoError(data.message || "Invalid promo code");
        setAppliedPromo(null);
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || "Could not validate code");
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setPromoInput("");
  };

  const handleUsePromo = (code) => {
    setPromoInput(code);
    setPromoError("");
    setAppliedPromo(null);
    setPromoLoading(true);
    api
      .post("/promo-codes/validate", {
        code,
        amount: subtotal,
        items: buildPromoValidationItems(),
      })
      .then((res) => {
        const data = res.data;
        if (data.valid) {
          setAppliedPromo({
            code: data.code,
            type: data.type,
            buyQty: data.buyQty,
            getQty: data.getQty,
            discountAmount: data.discountAmount,
            freeUnits: data.freeUnits || 0,
            freeBreakdown: Array.isArray(data.freeBreakdown) ? data.freeBreakdown : [],
            message: data.message,
          });
          setPromoInput("");
        } else {
          setPromoError(data.message || "Code not applicable");
        }
      })
      .catch(() => setPromoError("Could not apply code"))
      .finally(() => setPromoLoading(false));
  };

  const formatPromoDescription = (promo) => {
    let valueStr = "";
    if (promo.type === "buy_x_get_y") {
      valueStr = `Buy ${promo.buyQty || 0} Get ${promo.getQty || 0}`;
    } else if (promo.type === "percent") {
      valueStr = `${promo.value}% off`;
    } else {
      valueStr = `₹${Number(promo.value).toFixed(0)} off`;
    }
    if (promo.minOrderAmount && promo.minOrderAmount > 0) {
      return `${valueStr} on orders above ${formatPrice(promo.minOrderAmount)}`;
    }
    return valueStr;
  };

  const freeByNotebookId = (() => {
    const rows = Array.isArray(appliedPromo?.freeBreakdown) ? appliedPromo.freeBreakdown : [];
    return Object.fromEntries(
      rows.map((r) => [String(r.notebookId), { freeQty: Number(r.freeQty) || 0, freeAmount: Number(r.freeAmount) || 0 }])
    );
  })();
  const freeItemsDetailed = (() => {
    const rows = Array.isArray(appliedPromo?.freeBreakdown) ? appliedPromo.freeBreakdown : [];
    if (!rows.length) return [];
    return rows
      .map((row) => {
        const notebookId = String(row.notebookId);
        const cartItem = cart.find((item) => String(item.notebookId) === notebookId);
        if (!cartItem) return null;
        const freeQty = Number(row.freeQty) || 0;
        const freeAmount = Number(row.freeAmount) || 0;
        if (freeQty <= 0 || freeAmount <= 0) return null;
        const unitPrice = Number(cartItem.notebook?.price) || 0;
        return {
          notebookId,
          name: cartItem.notebook?.name || "Notebook",
          freeQty,
          unitPrice,
          freeAmount,
        };
      })
      .filter(Boolean);
  })();

  const formatValidUntil = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (shippingOptions.length > 0 && !selectedShippingOption) {
        setError("Please select a courier option before placing the order.");
        setLoading(false);
        return;
      }

      const orderData = {
        items: cart.map((item) => ({
          notebookId: item.notebookId,
          quantity: item.quantity,
        })),
        promoCode: appliedPromo?.code || undefined,
        contactDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        shippingOption: selectedShippingOption
          ? {
              courierCompanyId: selectedShippingOption.courierCompanyId,
              courierName: selectedShippingOption.courierName,
              rate: selectedShippingOption.rate,
              etdDays: selectedShippingOption.etdDays,
            }
          : undefined,
      };

      const paymentResponse = await api.post("/payment/initiate", orderData);
      const data = paymentResponse.data;

      if (data.success && data.paymentToken && data.accessKey) {
        sessionStorage.setItem("lastMerchantOrderId", data.merchantOrderId);
        openZwitchLayer(
          data.paymentToken,
          data.accessKey,
          data.merchantOrderId,
          data.layerScriptUrl
        );
      } else {
        setError(data.message || "Failed to initiate payment");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Contact Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile e.g. 9876543210"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter 10-digit Indian mobile number (with or without +91 / 0).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Delivery Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        required
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Shipping Options
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Live courier rates are fetched from Shiprocket based on delivery pincode, weight, and package dimensions.
                  </p>
                  {shippingLoading ? (
                    <p className="text-sm text-gray-300">Fetching courier options...</p>
                  ) : shippingOptions.length > 0 ? (
                    <div className="space-y-2">
                      {shippingOptions.map((opt) => {
                        const isSelected =
                          selectedShippingOption?.courierCompanyId === opt.courierCompanyId;
                        return (
                          <label
                            key={`${opt.courierCompanyId}-${opt.courierName}`}
                            className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 cursor-pointer ${
                              isSelected
                                ? "border-blue-500 bg-blue-900/20"
                                : "border-gray-600 bg-gray-700/40"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="radio"
                                name="shippingOption"
                                checked={isSelected}
                                onChange={() => setSelectedShippingOption(opt)}
                                className="accent-blue-500"
                              />
                              <div className="min-w-0">
                                <p className="text-sm text-white font-medium truncate">
                                  {opt.courierName}
                                </p>
                                {opt.etdDays && (
                                  <p className="text-xs text-gray-400">
                                    ETA: {opt.etdDays} days
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-blue-300">
                              {formatPrice(Number(opt.rate) || 0)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300">
                      {shippingError ||
                        "Enter a valid 6-digit pincode to see available courier options."}
                    </p>
                  )}
                </div>

                <p className="text-gray-400 text-xs">
                  By placing your order you agree to our{" "}
                  <Link href="/shipping" className="text-blue-400 hover:underline">Shipping Policy</Link>,{" "}
                  <Link href="/return" className="text-blue-400 hover:underline">Return Policy</Link>,{" "}
                  <Link href="/refund" className="text-blue-400 hover:underline">Refund Policy</Link>,{" "}
                  <Link href="/terms" className="text-blue-400 hover:underline">Terms & Conditions</Link>, and{" "}
                  <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.notebookId}
                      className="flex justify-between text-sm"
                    >
                      <div>
                        <span className="text-gray-400">
                          {item.notebook.name} x{item.quantity}
                        </span>
                        {freeByNotebookId[item.notebookId]?.freeQty > 0 && (
                          <p className="text-xs text-green-400">
                            {freeByNotebookId[item.notebookId].freeQty} item(s) free
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-white">
                          {formatPrice(
                            Math.max(
                              0,
                              item.notebook.price * item.quantity -
                                (freeByNotebookId[item.notebookId]?.freeAmount || 0)
                            )
                          )}
                        </span>
                        {freeByNotebookId[item.notebookId]?.freeAmount > 0 && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatPrice(item.notebook.price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Promo code */}
                <div className="border-t border-gray-700 pt-4 pb-4 space-y-3">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm text-green-400">
                        Discount ({appliedPromo.code}): −{formatPrice(appliedPromo.discountAmount)}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-xs text-gray-400 hover:text-red-400 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 w-full min-w-0">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        placeholder="Promo code"
                        className="w-full min-w-0 rounded-md bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 box-border"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        className="w-full py-2 rounded-md bg-gray-700 border border-gray-600 text-white text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
                      >
                        {promoLoading ? "Applying…" : "Apply"}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-xs text-red-400">{promoError}</p>
                  )}
                </div>
                {appliedPromo?.type === "buy_x_get_y" && freeItemsDetailed.length > 0 && (
                  <div className="border-t border-gray-700 pt-4 pb-4">
                    <p className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">
                      Free items unlocked ({appliedPromo.code})
                    </p>
                    <div className="space-y-2">
                      {freeItemsDetailed.map((item) => (
                        <div
                          key={`free-${item.notebookId}`}
                          className="rounded-md bg-green-900/20 border border-green-800/50 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">{item.name}</p>
                              <p className="text-xs text-green-300">
                                {item.freeQty} free item(s) × {formatPrice(item.unitPrice)}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-green-300">
                              −{formatPrice(item.freeAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Available promo codes */}
                {availablePromos.length > 0 && (
                  <div className="border-t border-gray-700 pt-4 pb-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Available offers</p>
                    <ul className="space-y-2">
                      {availablePromos.map((promo) => (
                        <li
                          key={promo.code}
                          className="rounded-md bg-gray-700/60 border border-gray-600 p-3 text-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="font-mono font-medium text-white">{promo.code}</span>
                              <p className="text-gray-400 mt-0.5">{formatPromoDescription(promo)}</p>
                              {promo.validUntil && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Valid till {formatValidUntil(promo.validUntil)}
                                  {promo.usesLeft != null && promo.usesLeft > 0 && (
                                    <span> · {promo.usesLeft} uses left</span>
                                  )}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUsePromo(promo.code)}
                              disabled={promoLoading || (appliedPromo?.code === promo.code)}
                              className="shrink-0 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {appliedPromo?.code === promo.code ? "Applied" : "Use code"}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {shippingIncluded ? (
                    <>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>
                          Shipping{" "}
                          {selectedShippingOption?.courierName
                            ? `(${selectedShippingOption.courierName})`
                            : "(Fallback)"}
                        </span>
                        <span className="text-white">{formatPrice(shippingCharge)}</span>
                      </div>
                      {!selectedShippingOption && (
                        <div className="text-xs text-gray-500">
                          Fallback estimate: {formatPrice(fallbackShippingCharge)} (Rs 26 per 500g)
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">
                      Enter delivery pincode to calculate shipping charges.
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>GST</span>
                    <span className="text-white">{formatPrice(gstAmount)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Discount ({appliedPromo.code})</span>
                      <span>−{formatPrice(appliedPromo.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                    <span className="text-white">
                      {shippingIncluded ? "Total" : "Total (without shipping)"}
                    </span>
                    <span className="text-blue-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
