"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui";

/**
 * ProtectedRoute — Route guard component.
 * Wraps page content and redirects unauthenticated users to /login.
 * Shows a loading spinner while auth state is being initialized from localStorage.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // While checking auth state (reading localStorage), show a centered loader
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Not authenticated — render nothing (redirect is happening via useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Authenticated — render the protected content
  return children;
}
