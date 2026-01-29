"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../../contexts/AdminAuthContext";

export default function AdminProfile() {
  const { admin, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push("/ijack/admin/login");
    }
  }, [admin, authLoading, router]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <>
      <main className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Profile</h2>
            <p className="text-gray-400">Your admin account details</p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <p className="text-white font-medium">{admin.username}</p>
              </div>
              {admin.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <p className="text-white">{admin.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
