import React from "react";
import {
  ShoppingBag,
  ChefHat,
  PackageCheck,
  IndianRupee,
  Utensils,
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
  Plus,
} from "lucide-react";

export default function Dashboard({ summary, recentOrders = [], onNavigate, onUpdateStatus }) {
  const sum = summary || {
    totalFoods: 0,
    outOfStockFoods: 0,
    totalStudents: 0,
    totalOrders: 0,
    todayOrdersCount: 0,
    pendingPreparingCount: 0,
    readyPickupCount: 0,
    totalSales: 0,
    todaySales: 0,
  };

  return (
    <div className="admin-dashboard-view">
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap orange">
            <ShoppingBag size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Today's Orders</span>
            <span className="kpi-value">{sum.todayOrdersCount}</span>
            <span className="kpi-subtext">Total all-time: {sum.totalOrders}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap blue">
            <ChefHat size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">In Kitchen / Queue</span>
            <span className="kpi-value">{sum.pendingPreparingCount}</span>
            <span className="kpi-subtext">Placed & cooking tickets</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <PackageCheck size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Ready for Pickup</span>
            <span className="kpi-value">{sum.readyPickupCount}</span>
            <span className="kpi-subtext">Awaiting student collection</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Today's Sales</span>
            <span className="kpi-value">₹{Number(sum.todaySales || 0).toLocaleString("en-IN")}</span>
            <span className="kpi-subtext">Total eligible: ₹{Number(sum.totalSales || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap red">
            <Utensils size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Active Menu Items</span>
            <span className="kpi-value">{sum.totalFoods}</span>
            <span className="kpi-subtext">
              {sum.outOfStockFoods > 0
                ? `⚠️ ${sum.outOfStockFoods} items sold out`
                : "All items in stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Strip */}
      <div className="admin-card" style={{ padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "1rem" }}>Quick Operations</h4>
            <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              Take immediate kitchen actions or update canteen catalog.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="btn-sm primary"
              onClick={() => onNavigate("orders")}
            >
              <ChefHat size={15} />
              <span>Process Incoming Orders</span>
            </button>
            <button
              type="button"
              className="btn-sm outline"
              onClick={() => onNavigate("products")}
            >
              <Plus size={15} />
              <span>Add / Edit Food</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Live Kitchen Feed (Recent Orders)</h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Showing latest pre-orders placed by students
            </span>
          </div>
          <button
            type="button"
            className="btn-sm outline"
            onClick={() => onNavigate("orders")}
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Student</th>
                <th>Items Summary</th>
                <th>Pickup Slot</th>
                <th>Total</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No recent orders in the queue.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const itemsCount = (order.items || []).reduce((sum, it) => sum + it.quantity, 0);
                  const itemsPreview = (order.items || [])
                    .map((it) => `${it.quantity}x ${it.nameSnapshot || it.productId?.name || "Dish"}`)
                    .slice(0, 2)
                    .join(", ");

                  return (
                    <tr key={order._id}>
                      <td>
                        <strong style={{ color: "#ea580c" }}>
                          #{order._id?.slice(-6).toUpperCase()}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.userId?.name || "Student"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {order.userId?.email || ""}
                        </div>
                      </td>
                      <td>
                        <span title={itemsPreview}>
                          {itemsPreview} {itemsCount > 2 ? `+${itemsCount - 2} more` : ""}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#334155" }}>
                          {order.pickupSlot || "Immediate"}
                        </span>
                      </td>
                      <td>
                        <strong>₹{order.totalAmount}</strong>
                      </td>
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-row">
                          {order.status === "Placed" || order.status === "Pending" ? (
                            <button
                              type="button"
                              className="btn-sm primary"
                              onClick={() => onUpdateStatus(order._id, "Accepted")}
                            >
                              Accept
                            </button>
                          ) : order.status === "Accepted" ? (
                            <button
                              type="button"
                              className="btn-sm primary"
                              onClick={() => onUpdateStatus(order._id, "Preparing")}
                            >
                              Start Cooking
                            </button>
                          ) : order.status === "Preparing" ? (
                            <button
                              type="button"
                              className="btn-sm success"
                              onClick={() => onUpdateStatus(order._id, "Ready")}
                            >
                              Mark Ready
                            </button>
                          ) : order.status === "Ready" ? (
                            <button
                              type="button"
                              className="btn-sm outline"
                              onClick={() => onUpdateStatus(order._id, "Completed")}
                            >
                              Mark Picked Up
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
