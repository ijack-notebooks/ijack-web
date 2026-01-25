"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import api from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import { formatPrice } from "../../../lib/currency";

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { clearCart } = useCart();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Reset attempt counter on mount
    sessionStorage.removeItem("paymentCheckAttempt");
    checkPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const checkPaymentStatus = async () => {
    try {
      // Get merchantOrderId from URL params
      // PhonePe redirects with merchantOrderId or it might be in the URL
      // Also check for orderId which PhonePe might send
      const merchantOrderId = searchParams.get("merchantOrderId") || 
                              searchParams.get("merchantTransactionId") || 
                              searchParams.get("transactionId") ||
                              searchParams.get("orderId");

      if (!merchantOrderId) {
        // If no merchantOrderId in URL, try to get it from sessionStorage (stored during checkout)
        const storedOrderId = sessionStorage.getItem("lastMerchantOrderId");
        if (storedOrderId) {
          const response = await api.get(`/payment/status/${storedOrderId}`);
          handlePaymentResponse(response);
          return;
        }
        
        setError("Payment information not found");
        setChecking(false);
        return;
      }

      // Check payment status
      const response = await api.get(`/payment/status/${merchantOrderId}`);
      handlePaymentResponse(response);
    } catch (error) {
      console.error("Payment status check error:", error);
      setError(error.response?.data?.message || "Failed to verify payment status");
      setChecking(false);
      sessionStorage.removeItem("paymentCheckAttempt");
    }
  };

  const handlePaymentResponse = (response) => {

    if (response.data.paymentStatus === "SUCCESS") {
      setOrder(response.data);
      clearCart();
      setChecking(false);
      sessionStorage.removeItem("paymentCheckAttempt");
      sessionStorage.removeItem("lastMerchantOrderId");
      // Redirect to order confirmation after 2 seconds
      setTimeout(() => {
        router.push(`/order-confirmation/${response.data.orderId}`);
      }, 2000);
    } else if (response.data.paymentStatus === "FAILED") {
      setError("Payment failed. Please try again.");
      setChecking(false);
      sessionStorage.removeItem("paymentCheckAttempt");
      sessionStorage.removeItem("lastMerchantOrderId");
    } else {
      // Still pending, poll again (max 15 attempts to avoid infinite loop)
      const maxAttempts = 15;
      const currentAttempt = parseInt(sessionStorage.getItem("paymentCheckAttempt") || "0");
      
      if (currentAttempt < maxAttempts) {
        sessionStorage.setItem("paymentCheckAttempt", (currentAttempt + 1).toString());
        setTimeout(() => {
          checkPaymentStatus();
        }, 3000); // Increased to 3 seconds for better reliability
      } else {
        setError("Payment is taking longer than expected. Please check your order status in 'My Orders'.");
        setChecking(false);
        sessionStorage.removeItem("paymentCheckAttempt");
      }
    }
  };

  if ((loading || checking) && !error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-xl">Processing your payment...</p>
            <p className="text-gray-400 mt-2">Please wait while we verify your payment</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Failed</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => router.push("/cart")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </main>
      </>
    );
  }

  if (order && order.paymentStatus === "SUCCESS") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-gray-300 mb-6">Redirecting to order confirmation...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </main>
      </>
    );
  }

  return null;
}
