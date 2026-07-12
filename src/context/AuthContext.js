"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/**
 * Decode JWT payload without a library.
 * Returns the payload object or null if decoding fails.
 */
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if a decoded token is expired.
 */
function isTokenExpired(decoded) {
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // True while reading localStorage on mount
  const router = useRouter();

  // On mount, restore auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("foodpro_token");
      if (storedToken) {
        const decoded = decodeToken(storedToken);
        if (decoded && !isTokenExpired(decoded)) {
          setToken(storedToken);
          setUser(decoded);
        } else {
          // Token is expired or invalid — clean up
          localStorage.removeItem("foodpro_token");
        }
      }
    } catch {
      // localStorage not available (SSR) — ignore
    }
    setLoading(false);
  }, []);

  /**
   * Login: store token in localStorage and update state.
   * @param {string} newToken - The JWT token from the backend.
   * @param {object} userInfo - The user object from the login response.
   */
  const login = useCallback((newToken, userInfo) => {
    localStorage.setItem("foodpro_token", newToken);
    setToken(newToken);
    setUser(userInfo || decodeToken(newToken));
    router.push("/dashboard");
  }, [router]);

  /**
   * Logout: remove token from localStorage and redirect to /login.
   */
  const logout = useCallback(() => {
    localStorage.removeItem("foodpro_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
