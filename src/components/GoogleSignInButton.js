"use client";

import { useRef, useEffect, useState } from "react";
import Script from "next/script";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ onSuccess, onError, disabled, loading }) {
  const containerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current || !scriptLoaded || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            onSuccess?.(response.credential);
          } else {
            onError?.("Google sign-in was cancelled or failed.");
          }
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        size: "large",
        width: 320,
        text: "signin_with",
        shape: "rectangular",
        theme: "outline",
      });
    } catch (err) {
      onError?.(err.message || "Failed to load Google sign-in.");
    }
  }, [scriptLoaded, onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="text-sm text-gray-400 py-2">
        Google sign-in is not configured (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID).
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className={disabled || loading ? "opacity-50 pointer-events-none" : ""}
          style={{ minHeight: 40 }}
        />
      </div>
      {loading && (
        <p className="text-center text-sm text-gray-400 mt-2">Signing in...</p>
      )}
    </>
  );
}
