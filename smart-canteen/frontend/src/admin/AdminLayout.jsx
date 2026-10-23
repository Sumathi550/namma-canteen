import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

const NAV_TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Order Management", icon: ShoppingBag },
  { id: "products", label: "Food Menu & Stock", icon: UtensilsCrossed },
  { id: "users", label: "Students Directory", icon: Users },
  { id: "reports", label: "Sales Reports", icon: BarChart3 },
  { id: "settings", label: "Canteen Settings", icon: Settings },
];

export default function AdminLayout({ activeTab, setActiveTab, onRefresh, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="admin-layout-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div className="admin-brand-title">Namma<span>Canteen</span></div>
            <span className="admin-brand-badge">நம்ம கேன்டீன் • Kitchen Ops</span>
          </div>
        </div>

        <nav className="admin-nav-links">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="back-to-store-link">
            <ArrowLeft size={16} />
            <span>Return to Student Menu</span>
          </Link>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Staff Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-main-wrap">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="topbar-page-title">
              {NAV_TABS.find((t) => t.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="topbar-right">
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span>Kitchen Active</span>
            </div>

            {onRefresh && (
              <button
                type="button"
                className="btn-sm outline"
                onClick={onRefresh}
                title="Refresh All Data"
              >
                <RefreshCw size={14} />
                <span>Sync</span>
              </button>
            )}

            <div className="admin-profile-chip">
              <div className="admin-avatar">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <span>{user?.name || "Admin Staff"}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="admin-page-content">{children}</main>
      </div>
    </div>
  );
}
