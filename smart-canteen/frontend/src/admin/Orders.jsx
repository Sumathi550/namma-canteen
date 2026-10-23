import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  XCircle,
  Clock,
  RefreshCw,
  Phone,
  Mail,
  User,
} from "lucide-react";

const STATUS_TABS = [
  "All",
  "Placed",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

export default function Orders({ orders = [], onUpdateStatus, loading, onRefresh }) {
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeStatus !== "All") {
        if (activeStatus === "Placed" && (o.status === "Placed" || o.status === "Pending")) {
          // match both Placed and legacy Pending
        } else if (o.status !== activeStatus) {
          return false;
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchToken = o._id?.toLowerCase().includes(q);
        const matchName = o.userId?.name?.toLowerCase().includes(q);
        const matchEmail = o.userId?.email?.toLowerCase().includes(q);
        if (!matchToken && !matchName && !matchEmail) return false;
      }

      return true;
    });
  }, [orders, activeStatus, search]);

  async function handleStatusChange(orderId, newStatus) {
    let reason = "";
    if (newStatus === "Cancelled") {
      reason = window.prompt("Enter reason for order rejection/cancellation:", "Item out of ingredients / Canteen closed");
      if (reason === null) return; // user cancelled prompt
    }

    setActionLoadingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus, reason);
    } finally {
      setActionLoadingId("");
    }
  }

  return (
    <div className="admin-orders-view">
      {/* Top Filter Bar */}
      <div className="admin-card" style={{ padding: "1.25rem 1.5rem" }}>
        {/* Status Tabs */}
        <div className="status-tabs-row">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All"
                ? orders.length
                : orders.filter((o) =>
                    tab === "Placed"
                      ? o.status === "Placed" || o.status === "Pending"
                      : o.status === tab
                  ).length;

            return (
              <button
                key={tab}
                type="button"
                className={`status-tab ${activeStatus === tab ? "active" : ""}`}
                onClick={() => setActiveStatus(tab)}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
            />
            <input
              type="text"
              placeholder="Search by Token ID, student name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem 0.55rem 2.25rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="button"
            className="btn-sm outline"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Sync Orders</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Live Kitchen Orders Queue</h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Showing {filteredOrders.length} orders
            </span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Student Details</th>
                <th>Pickup Slot</th>
                <th>Ordered Items</th>
                <th>Total</th>
                <th>Current Status</th>
                <th>Kitchen Progress Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
                    No orders match the current status filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isBusy = actionLoadingId === order._id;

                  return (
                    <tr key={order._id}>
                      {/* Token */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong style={{ fontSize: "1rem", color: "#ea580c" }}>
                            #{order._id?.slice(-6).toUpperCase()}
                          </strong>
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Student */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <strong style={{ fontSize: "0.9rem" }}>
                            {order.userId?.name || "Student"}
                          </strong>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {order.userId?.email || "No email"}
                          </span>
                          {order.userId?.phone && (
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              📞 {order.userId.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pickup Slot */}
                      <td>
                        <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#1e293b" }}>
                          {order.pickupSlot || "Immediate"}
                        </span>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          Payment: {order.paymentStatus || "Pay on Pickup"}
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          {(order.items || []).map((it, idx) => (
                            <span key={idx} style={{ fontSize: "0.82rem" }}>
                              <strong>{it.quantity}x</strong>{" "}
                              {it.nameSnapshot || it.productId?.name || "Dish"}{" "}
                              <span style={{ color: "#64748b" }}>
                                (₹{(it.priceSnapshot || it.price || 0) * it.quantity})
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td>
                        <strong style={{ fontSize: "1.05rem" }}>
                          ₹{order.totalAmount}
                        </strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Kitchen Actions */}
                      <td>
                        <div className="action-btn-row">
                          {order.status === "Placed" || order.status === "Pending" ? (
                            <>
                              <button
                                type="button"
                                className="btn-sm primary"
                                disabled={isBusy}
                                onClick={() => handleStatusChange(order._id, "Accepted")}
                              >
                                Accept Ticket
                              </button>
                              <button
                                type="button"
                                className="btn-sm danger"
                                disabled={isBusy}
                                onClick={() => handleStatusChange(order._id, "Cancelled")}
                              >
                                Reject
                              </button>
                            </>
                          ) : order.status === "Accepted" ? (
                            <button
                              type="button"
                              className="btn-sm primary"
                              disabled={isBusy}
                              onClick={() => handleStatusChange(order._id, "Preparing")}
                            >
                              <ChefHat size={14} />
                              <span>Start Cooking</span>
                            </button>
                          ) : order.status === "Preparing" ? (
                            <button
                              type="button"
                              className="btn-sm success"
                              disabled={isBusy}
                              onClick={() => handleStatusChange(order._id, "Ready")}
                            >
                              <PackageCheck size={14} />
                              <span>Mark Ready</span>
                            </button>
                          ) : order.status === "Ready" ? (
                            <button
                              type="button"
                              className="btn-sm outline"
                              disabled={isBusy}
                              onClick={() => handleStatusChange(order._id, "Completed")}
                            >
                              <CheckCircle2 size={14} />
                              <span>Complete Pickup</span>
                            </button>
                          ) : order.status === "Completed" ? (
                            <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 600 }}>
                              ✓ Collected
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>
                              {order.cancellationReason || "Cancelled"}
                            </span>
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
