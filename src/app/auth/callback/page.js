"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy OAuth callback route. Google sign-in now uses the button on login/signup
 * and does not redirect here. Redirect any visitors to login.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Redirecting to login...</div>
    </main>
  );
}
