"use client";

import { ApiUser, authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: ApiUser | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function AuthCheck({
  isAuthPage,
  children,
}: {
  isAuthPage: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (): Promise<boolean> => {
    try {
      const userData = await authApi.checkAuth(true);
      if (userData && typeof userData === "object") {
        setUser(userData);
      } else {
        setUser(null);
      }
      return !!userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push("/auth");
  };

  useEffect(() => {
    // Skip auth check on auth pages
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    // Check authentication status
    const checkAuth = async () => {
      const success = await refreshUser();
      if (!success && !isAuthPage) {
        router.push("/auth");
      }
    };

    checkAuth();
  }, [isAuthPage, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
