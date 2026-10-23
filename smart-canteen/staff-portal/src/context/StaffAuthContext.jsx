import React, { createContext, useContext, useState, useEffect } from "react";
import { staffApi } from "../services/api";

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("staffUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("staffToken") || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setToken("");
    }
    window.addEventListener("staff-auth-expired", handleExpired);
    return () => window.removeEventListener("staff-auth-expired", handleExpired);
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await staffApi.login(email, password);
      const staffUser = res.admin || res.user;
      const staffToken = res.token;

      setUser(staffUser);
      setToken(staffToken);

      localStorage.setItem("staffUser", JSON.stringify(staffUser));
      localStorage.setItem("staffToken", staffToken);

      return res;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken("");
    localStorage.removeItem("staffUser");
    localStorage.removeItem("staffToken");
  }

  const isAuthenticated = Boolean(token && user);

  return (
    <StaffAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used within StaffAuthProvider");
  return ctx;
}
