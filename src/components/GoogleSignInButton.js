"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Script from "next/script";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** GSI allows only one initialize() per page per client_id — share across route changes. */
let gsiInitializedClientId = null;
/** Dispatch credentials to whichever screen mounted the button (initialize callback is fixed once). */
let gsiDispatch = null;

export default function GoogleSignInButton({ onSuccess, onError, disabled, loading }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  /** DOM node for GSI — state + callback ref so effects re-run when the host mounts (refs alone don’t trigger effects). */
  const [buttonHost, setButtonHost] = useState(null);
  const setButtonHostRef = useCallback((node) => {
    setButtonHost(node);
  }, []);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    gsiDispatch = {
      success: (token) => onSuccessRef.current?.(token),
      error: (msg) => onErrorRef.current?.(msg),
    };
    return () => {
      gsiDispatch = null;
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptLoaded || !buttonHost) return;

    const google = window.google?.accounts?.id;
    if (!google) return;

    try {
      if (gsiInitializedClientId !== GOOGLE_CLIENT_ID) {
        google.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response?.credential) {
              gsiDispatch?.success?.(response.credential);
            } else {
              gsiDispatch?.error?.("Google sign-in was cancelled or failed.");
            }
          },
        });
        gsiInitializedClientId = GOOGLE_CLIENT_ID;
      }

      buttonHost.innerHTML = "";
      google.renderButton(buttonHost, {
        type: "standard",
        size: "large",
        width: 320,
        text: "signin_with",
        shape: "rectangular",
        theme: "outline",
      });
    } catch (err) {
      onErrorRef.current?.(err.message || "Failed to load Google sign-in.");
    }

    return () => {
      buttonHost.innerHTML = "";
    };
  }, [scriptLoaded, buttonHost]);

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
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="flex justify-center">
        <div
          ref={setButtonHostRef}
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
