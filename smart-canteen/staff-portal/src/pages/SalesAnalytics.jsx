import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, RefreshCw, Award } from "lucide-react";
import { staffApi } from "../services/api";

export default function SalesAnalytics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await staffApi.getDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="staff-page-container">
        <div className="empty-state-box">
          <RefreshCw size={36} className="animate-spin" />
          <p>Calculating Sales & Analytics...</p>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const recentOrders = dashboardData?.recentOrders || [];

  return (
    <div className="staff-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            <BarChart3 size={28} style={{ color: "#ea580c" }} />
            <span>Sales & Kitchen Analytics</span>
          </h1>
          <p className="page-header-sub">
            Campus order volume, fulfillment performance, and daily revenue statistics.
          </p>
        </div>

        <button type="button" className="icon-toggle-btn" onClick={loadData}>
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Today's Revenue</div>
            <div className="kpi-value" style={{ color: "#4ade80" }}>
              ₹{summary.todaySales ?? 0}
            </div>
          </div>
          <div className="kpi-icon-wrap green">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">All-Time Canteen Sales</div>
            <div className="kpi-value" style={{ color: "#38bdf8" }}>
              ₹{summary.totalSales ?? 0}
            </div>
          </div>
          <div className="kpi-icon-wrap cyan">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Today's Total Orders</div>
            <div className="kpi-value" style={{ color: "#fb923c" }}>
              {summary.todayOrdersCount ?? 0}
            </div>
          </div>
          <div className="kpi-icon-wrap orange">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Registered Students</div>
            <div className="kpi-value" style={{ color: "#c084fc" }}>
              {summary.totalStudents ?? 0}
            </div>
          </div>
          <div className="kpi-icon-wrap purple">
            <Users size={24} />
          </div>
        </div>
      </section>

      {/* Recent Kitchen Orders Table */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem"
        }}
      >
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShoppingBag size={20} style={{ color: "#fb923c" }} />
          <span>Recent Kitchen Activity</span>
        </h3>

        {recentOrders.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No recent orders.</p>
        ) : (
          <div className="menu-table-wrap">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>Order Token</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Slot</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fb923c" }}>
                        #TN-{o._id.slice(-4).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.userId?.name || "Student"}</div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{o.userId?.email || ""}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>
                        {o.items?.map((i) => `${i.quantity}x ${i.nameSnapshot || i.productId?.name || "Food"}`).join(", ")}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>{o.pickupSlot || "Immediate"}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fff" }}>
                        ₹{o.totalAmount}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${(o.status || "placed").toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
