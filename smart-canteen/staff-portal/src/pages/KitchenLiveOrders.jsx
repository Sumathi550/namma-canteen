import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Bell,
  Printer,
  XCircle,
  ChefHat,
  ShoppingBag,
  User,
  Phone,
  Calendar,
  Layers
} from "lucide-react";
import { staffApi } from "../services/api";
import { soundNotifier } from "../components/LiveAudioNotifier";

export default function KitchenLiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Active"); // 'Active', 'All', 'Placed', 'Preparing', 'Ready', 'Completed'
  const [search, setSearch] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const prevOrderCountRef = useRef(0);

  // Load orders
  async function fetchOrders(silent = false) {
    if (!silent) setRefreshing(true);
    try {
      const res = await staffApi.getOrders();
      const fetched = res.orders || [];

      // Check if new orders arrived to ring kitchen chime
      const activeNewOrders = fetched.filter((o) => o.status === "Placed" || o.status === "Pending");
      if (prevOrderCountRef.current > 0 && activeNewOrders.length > prevOrderCountRef.current) {
        soundNotifier.playOrderChime();
      }
      prevOrderCountRef.current = activeNewOrders.length;

      setOrders(fetched);
    } catch (err) {
      console.error("Failed to fetch live orders:", err);
    } finally {
      if (!silent) setRefreshing(false);
      setLoading(false);
    }
  }

  // Auto-polling every 3 seconds for zero-lag kitchen synchronization
  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Status transitions
  async function handleStatusChange(orderId, nextStatus) {
    try {
      await staffApi.updateOrderStatus(orderId, nextStatus);
      fetchOrders(true);
    } catch (err) {
      alert(err.message || "Could not update order status.");
    }
  }

  async function handleConfirmCancel() {
    if (!cancellingOrderId) return;
    try {
      await staffApi.updateOrderStatus(cancellingOrderId, "Cancelled", cancellationReason || "Cancelled by kitchen staff");
      setCancellingOrderId(null);
      setCancellationReason("");
      fetchOrders(true);
    } catch (err) {
      alert(err.message || "Failed to cancel order.");
    }
  }

  // Calculate KPIs
  const totalCount = orders.length;
  const placedCount = orders.filter((o) => o.status === "Placed" || o.status === "Pending").length;
  const preparingCount = orders.filter((o) => o.status === "Preparing" || o.status === "Accepted").length;
  const readyCount = orders.filter((o) => o.status === "Ready").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  const todayRevenue = orders
    .filter((o) => o.status === "Completed" || o.status === "Ready")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filter & Search
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (filterStatus === "Active") {
      if (order.status === "Completed" || order.status === "Cancelled") return false;
    } else if (filterStatus !== "All") {
      if (filterStatus === "Placed" && order.status !== "Placed" && order.status !== "Pending") return false;
      if (filterStatus === "Preparing" && order.status !== "Preparing" && order.status !== "Accepted") return false;
      if (filterStatus === "Ready" && order.status !== "Ready") return false;
      if (filterStatus === "Completed" && order.status !== "Completed") return false;
      if (filterStatus === "Cancelled" && order.status !== "Cancelled") return false;
    }

    // Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const idMatch = order._id?.toLowerCase().includes(q);
      const nameMatch = order.userId?.name?.toLowerCase().includes(q);
      const phoneMatch = order.userId?.phone?.toLowerCase().includes(q);
      const tokenMatch = order._id?.slice(-4).toLowerCase().includes(q);
      if (!idMatch && !nameMatch && !phoneMatch && !tokenMatch) return false;
    }

    return true;
  });

  function formatTime(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="staff-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            <Flame size={28} style={{ color: "#ea580c" }} />
            <span>Kitchen Display System (KDS)</span>
          </h1>
          <p className="page-header-sub">
            Real-time live incoming orders from Namma Canteen student portal.
          </p>
        </div>

        <button
          type="button"
          className="icon-toggle-btn"
          onClick={() => fetchOrders(false)}
          disabled={refreshing}
          title="Manual refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          <span>{refreshing ? "Refreshing..." : "Sync Orders"}</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">New Incoming (Placed)</div>
            <div className="kpi-value" style={{ color: "#fb923c" }}>
              {placedCount}
            </div>
          </div>
          <div className="kpi-icon-wrap orange">
            <Bell size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Cooking (In Prep)</div>
            <div className="kpi-value" style={{ color: "#60a5fa" }}>
              {preparingCount}
            </div>
          </div>
          <div className="kpi-icon-wrap blue">
            <ChefHat size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Ready for Pickup</div>
            <div className="kpi-value" style={{ color: "#c084fc" }}>
              {readyCount}
            </div>
          </div>
          <div className="kpi-icon-wrap purple">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Completed Handed Over</div>
            <div className="kpi-value" style={{ color: "#4ade80" }}>
              {completedCount}
            </div>
          </div>
          <div className="kpi-icon-wrap green">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Today's Kitchen Sales</div>
            <div className="kpi-value" style={{ color: "#38bdf8" }}>
              ₹{todayRevenue}
            </div>
          </div>
          <div className="kpi-icon-wrap cyan">
            <Layers size={24} />
          </div>
        </div>
      </section>

      {/* Filters & Search Strip */}
      <div className="controls-strip">
        <div className="filter-tab-pills">
          <button
            type="button"
            className={`filter-pill ${filterStatus === "Active" ? "active" : ""}`}
            onClick={() => setFilterStatus("Active")}
          >
            🔥 Active Kitchen ({placedCount + preparingCount + readyCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "Placed" ? "active" : ""}`}
            onClick={() => setFilterStatus("Placed")}
          >
            🔔 Placed ({placedCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "Preparing" ? "active" : ""}`}
            onClick={() => setFilterStatus("Preparing")}
          >
            👨‍🍳 Preparing ({preparingCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "Ready" ? "active" : ""}`}
            onClick={() => setFilterStatus("Ready")}
          >
            ✨ Ready for Pickup ({readyCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "Completed" ? "active" : ""}`}
            onClick={() => setFilterStatus("Completed")}
          >
            ✅ Completed ({completedCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "All" ? "active" : ""}`}
            onClick={() => setFilterStatus("All")}
          >
            All Orders ({totalCount})
          </button>
        </div>

        <div className="search-field-wrap">
          <Search size={16} style={{ color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search by Token, Student, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Live Orders Grid */}
      {loading ? (
        <div className="empty-state-box">
          <RefreshCw size={36} className="animate-spin" />
          <p>Connecting to Live Kitchen Order Stream...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <ChefHat size={32} />
          </div>
          <h3>No Orders Found</h3>
          <p>
            {filterStatus === "Active"
              ? "All caught up! No pending kitchen orders right now."
              : `No orders match filter "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const tokenCode = order._id ? `#TN-${order._id.slice(-4).toUpperCase()}` : "#TOKEN";
            const statusKey = (order.status || "placed").toLowerCase();

            return (
              <div key={order._id} className="order-card">
                {/* Order Header */}
                <div className="order-card-header">
                  <div className="token-badge">
                    <span>{tokenCode}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className={`status-tag ${statusKey}`}>
                      {order.status === "Placed" && "🔔 Placed"}
                      {order.status === "Pending" && "🔔 Placed"}
                      {order.status === "Preparing" && "👨‍🍳 Cooking"}
                      {order.status === "Accepted" && "👨‍🍳 Cooking"}
                      {order.status === "Ready" && "✨ Ready at Counter"}
                      {order.status === "Completed" && "✅ Handed Over"}
                      {order.status === "Cancelled" && "❌ Cancelled"}
                    </span>
                    <span
                      style={{
                        background: order.paymentStatus === "Paid" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: order.paymentStatus === "Paid" ? "#4ade80" : "#f87171",
                        border: `1px solid ${order.paymentStatus === "Paid" ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                        padding: "2px 7px",
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                      title={order.paymentRef ? `UTR: ${order.paymentRef}` : "Verified via UPI"}
                    >
                      {order.paymentStatus === "Paid" ? "✓ PAID (GPay UPI)" : "⚠️ Pay on Pickup"}
                    </span>
                  </div>
                </div>

                {/* Customer Info & Slot */}
                <div className="order-customer-bar">
                  <div>
                    <div className="customer-name">{order.userId?.name || "Student Customer"}</div>
                    <div className="customer-contact">
                      {order.userId?.email || order.userId?.phone || "Campus Order"} • {formatTime(order.createdAt)}
                      {order.paymentRef && (
                        <span style={{ marginLeft: "6px", color: "#38bdf8", fontWeight: "600", fontFamily: "monospace" }}>
                          [{order.paymentRef}]
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pickup-slot-tag" title="Selected Pickup Window">
                    <Clock size={12} />
                    <span>{order.pickupSlot || "Immediate"}</span>
                  </div>
                </div>

                {/* Items Checklist */}
                <div className="order-items-scroll">
                  {order.items?.map((item, idx) => {
                    const itemName = item.nameSnapshot || item.productId?.name || "Food Item";
                    const itemQty = item.quantity || 1;
                    const itemPrice = item.priceSnapshot || item.price || 0;

                    return (
                      <div key={idx} className="order-item-row">
                        <div className="item-qty-name">
                          <span className="item-qty-badge">{itemQty}x</span>
                          <span>{itemName}</span>
                        </div>
                        <span className="item-price-tag">₹{itemPrice * itemQty}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer with 1-Click Status Controls */}
                <div className="order-footer">
                  <div className="total-strip">
                    <span style={{ color: "#94a3b8" }}>
                      Total ({order.items?.reduce((s, i) => s + (i.quantity || 1), 0)} items):
                    </span>
                    <span className="total-amount">₹{order.totalAmount}</span>
                  </div>

                  <div className="action-buttons-row">
                    {/* Status Action Button */}
                    {(order.status === "Placed" || order.status === "Pending") && (
                      <button
                        type="button"
                        className="btn-status-action accept"
                        onClick={() => handleStatusChange(order._id, "Preparing")}
                      >
                        <ChefHat size={16} />
                        <span>Accept & Start Cooking</span>
                      </button>
                    )}

                    {(order.status === "Preparing" || order.status === "Accepted") && (
                      <button
                        type="button"
                        className="btn-status-action ready"
                        onClick={() => handleStatusChange(order._id, "Ready")}
                      >
                        <Bell size={16} />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {order.status === "Ready" && (
                      <button
                        type="button"
                        className="btn-status-action complete"
                        onClick={() => handleStatusChange(order._id, "Completed")}
                      >
                        <CheckCircle2 size={16} />
                        <span>Handover & Complete</span>
                      </button>
                    )}

                    {order.status === "Completed" && (
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "0.85rem",
                          color: "#4ade80",
                          fontWeight: 600,
                          padding: "0.5rem"
                        }}
                      >
                        ✓ Order Fulfilled
                      </div>
                    )}

                    {order.status === "Cancelled" && (
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "0.82rem",
                          color: "#f87171",
                          fontStyle: "italic",
                          padding: "0.5rem"
                        }}
                      >
                        Reason: {order.cancellationReason || "Cancelled"}
                      </div>
                    )}

                    {/* Quick Cancel Button for Active Orders */}
                    {order.status !== "Completed" && order.status !== "Cancelled" && (
                      <button
                        type="button"
                        className="btn-cancel-action"
                        onClick={() => setCancellingOrderId(order._id)}
                        title="Cancel this order"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancellingOrderId && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Cancel Kitchen Order</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCancellingOrderId(null)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.86rem", marginBottom: "1rem" }}>
              Please provide a reason to notify the student customer:
            </p>
            <div className="form-group">
              <select
                className="form-select"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="Item ran out of stock in kitchen">Item ran out of stock in kitchen</option>
                <option value="Kitchen closing for break">Kitchen closing for break</option>
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Payment verification issue">Payment verification issue</option>
                <option value="Unforeseen kitchen equipment delay">Unforeseen kitchen delay</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="icon-toggle-btn"
                onClick={() => setCancellingOrderId(null)}
              >
                Go Back
              </button>
              <button
                type="button"
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
