import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StaffAuthProvider, useStaffAuth } from "./context/StaffAuthContext";
import StaffNavbar from "./components/StaffNavbar";
import StaffLogin from "./pages/StaffLogin";
import KitchenLiveOrders from "./pages/KitchenLiveOrders";
import MenuManager from "./pages/MenuManager";
import CanteenSettings from "./pages/CanteenSettings";
import SalesAnalytics from "./pages/SalesAnalytics";
import { staffApi } from "./services/api";

function StaffAppRoutes() {
  const { isAuthenticated, loading } = useStaffAuth();
  const [pendingCount, setPendingCount] = useState(0);

  // Poll for pending orders count for the navbar badge
  useEffect(() => {
    if (!isAuthenticated) return;
    async function checkPending() {
      try {
        const res = await staffApi.getOrders({ status: "Placed" });
        setPendingCount(res.orders?.length || 0);
      } catch (e) {}
    }
    checkPending();
    const iv = setInterval(checkPending, 5000);
    return () => clearInterval(iv);
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1120", color: "#fff" }}>
        Loading Namma Canteen Staff Portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <StaffLogin />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <StaffNavbar pendingOrdersCount={pendingCount} />
      <Routes>
        <Route path="/" element={<KitchenLiveOrders />} />
        <Route path="/menu" element={<MenuManager />} />
        <Route path="/settings" element={<CanteenSettings />} />
        <Route path="/analytics" element={<SalesAnalytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <StaffAuthProvider>
      <BrowserRouter>
        <StaffAppRoutes />
      </BrowserRouter>
    </StaffAuthProvider>
  );
}
