"use client";

import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCheck({ isAuthPage }: { isAuthPage: boolean }) {
  const router = useRouter();

  useEffect(() => {
    // Skip auth check on auth pages
    if (isAuthPage) return;

    // Check authentication status
    const checkAuth = async () => {
      try {
        const user = await authApi.checkAuth();
        // If not authenticated and not on auth page, redirect to login
        if (!user && !isAuthPage) {
          router.push("/auth");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Redirect to login page on auth error
        router.push("/auth");
      }
    };

    checkAuth();
  }, [isAuthPage, router]);

  // This component doesn't render anything
  return null;
}
