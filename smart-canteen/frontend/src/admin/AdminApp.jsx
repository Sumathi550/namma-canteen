import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Products from "./Products";
import Users from "./Users";
import Reports from "./Reports";
import Settings from "./Settings";
import { api } from "../services/api";

export default function AdminApp() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    setLoading(true);
    try {
      const [dashRes, ordersRes, prodsRes, usersRes, repRes, setRes] =
        await Promise.all([
          api.getAdminDashboard().catch(() => ({})),
          api.getAdminOrders().catch(() => ({ orders: [] })),
          api.getProducts({ includeArchived: true }).catch(() => ({ products: [] })),
          api.getAdminUsers().catch(() => ({ users: [] })),
          api.getAdminReports().catch(() => ({ reports: null })),
          api.getAdminSettings().catch(() => ({ settings: null })),
        ]);

      if (dashRes.summary) setDashboardData(dashRes);
      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (prodsRes.products) setProducts(prodsRes.products);
      if (usersRes.users) setUsers(usersRes.users);
      if (repRes.reports) setReports(repRes.reports);
      if (setRes.settings) setSettings(setRes.settings);
    } catch (err) {
      console.error("Admin sync failed:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      refreshAll();
    }
  }, [isAuthenticated, isAdmin, refreshAll]);

  // Polling for incoming orders every 10 seconds
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    const interval = setInterval(() => {
      api.getAdminOrders()
        .then((res) => {
          if (res.orders) setOrders(res.orders);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin]);

  // Guard: if not admin, show Admin Login view
  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin />;
  }

  // Action handlers
  async function handleUpdateStatus(orderId, status, cancellationReason) {
    try {
      await api.updateOrderStatus(orderId, status, cancellationReason);
      // Refresh orders and dashboard
      const updatedOrders = await api.getAdminOrders();
      if (updatedOrders.orders) setOrders(updatedOrders.orders);
      const dash = await api.getAdminDashboard();
      if (dash.summary) setDashboardData(dash);
    } catch (err) {
      alert(err.message || "Failed to update order status.");
    }
  }

  function notifyCanteenMenuUpdated() {
    window.dispatchEvent(new CustomEvent("canteen-menu-updated"));
    try {
      localStorage.setItem("canteenLastMenuUpdate", String(Date.now()));
    } catch (e) {}
  }

  async function handleAddProduct(productData) {
    try {
      await api.addProduct(productData);
      const res = await api.getProducts({ includeArchived: true });
      if (res.products) setProducts(res.products);
      const dash = await api.getAdminDashboard();
      if (dash.summary) setDashboardData(dash);
      notifyCanteenMenuUpdated();
    } catch (err) {
      alert(err.message || "Failed to add food item.");
      throw err;
    }
  }

  async function handleUpdateProduct(id, productData) {
    try {
      await api.updateProduct(id, productData);
      const res = await api.getProducts({ includeArchived: true });
      if (res.products) setProducts(res.products);
      notifyCanteenMenuUpdated();
    } catch (err) {
      alert(err.message || "Failed to update food item.");
      throw err;
    }
  }

  async function handleToggleAvailability(id, available) {
    try {
      await api.toggleProductAvailability(id, available);
      const res = await api.getProducts({ includeArchived: true });
      if (res.products) setProducts(res.products);
      const dash = await api.getAdminDashboard();
      if (dash.summary) setDashboardData(dash);
      notifyCanteenMenuUpdated();
    } catch (err) {
      alert(err.message || "Failed to toggle availability.");
    }
  }

  async function handleArchiveProduct(id) {
    try {
      await api.archiveProduct(id);
      const res = await api.getProducts({ includeArchived: true });
      if (res.products) setProducts(res.products);
      const dash = await api.getAdminDashboard();
      if (dash.summary) setDashboardData(dash);
      notifyCanteenMenuUpdated();
    } catch (err) {
      alert(err.message || "Failed to archive food item.");
    }
  }

  async function handleSaveSettings(settingsData) {
    try {
      const res = await api.updateAdminSettings(settingsData);
      if (res.settings) setSettings(res.settings);
    } catch (err) {
      alert(err.message || "Failed to save settings.");
    }
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onRefresh={refreshAll}
    >
      {activeTab === "dashboard" && (
        <Dashboard
          summary={dashboardData?.summary}
          recentOrders={orders.slice(0, 8)}
          onNavigate={setActiveTab}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeTab === "orders" && (
        <Orders
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
          onRefresh={refreshAll}
        />
      )}

      {activeTab === "products" && (
        <Products
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onToggleAvailability={handleToggleAvailability}
          onArchiveProduct={handleArchiveProduct}
          loading={loading}
        />
      )}

      {activeTab === "users" && (
        <Users users={users} loading={loading} />
      )}

      {activeTab === "reports" && (
        <Reports reports={reports} loading={loading} />
      )}

      {activeTab === "settings" && (
        <Settings
          settings={settings}
          onSaveSettings={handleSaveSettings}
          loading={loading}
        />
      )}
    </AdminLayout>
  );
}
