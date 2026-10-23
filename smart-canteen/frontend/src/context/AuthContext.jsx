import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("canteenUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("canteenToken") || "";
  });

  const [loading, setLoading] = useState(false);

  // Sync token and user in localStorage
  function setSession(newToken, newUser) {
    if (newToken) {
      localStorage.setItem("canteenToken", newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem("canteenToken");
      setToken("");
    }

    if (newUser) {
      localStorage.setItem("canteenUser", JSON.stringify(newUser));
      setUser(newUser);
    } else {
      localStorage.removeItem("canteenUser");
      setUser(null);
    }
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const result = await api.login({ email, password });
      setSession(result.token, result.user);
      return result;
    } finally {
      setLoading(false);
    }
  }

  async function adminLogin(email, password) {
    setLoading(true);
    try {
      const result = await api.adminLogin({ email, password });
      const adminUser = result.admin || result.user;
      setSession(result.token, adminUser);
      return result;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password, phone) {
    setLoading(true);
    try {
      const result = await api.register({ name, email, password, phone });
      setSession(result.token, result.user);
      return result;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession("", null);
  }

  async function refreshProfile() {
    if (!token) return null;
    try {
      const result = await api.getProfile();
      if (result.user) {
        setSession(token, result.user);
        return result.user;
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
      }
    }
    return null;
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user && user.role === "admin"),
    login,
    adminLogin,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
