import React from "react";
import {
  X,
  Clock3,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  XCircle,
  RefreshCw,
  AlertTriangle,
  LoaderCircle,
  ShoppingBag,
} from "lucide-react";

const STAGES = [
  { key: "Placed", label: "Placed", icon: Clock3 },
  { key: "Accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "Preparing", label: "Preparing", icon: ChefHat },
  { key: "Ready", label: "Ready for Pickup", icon: PackageCheck },
  { key: "Completed", label: "Collected", icon: CheckCircle2 },
];

function getStageIndex(status) {
  if (status === "Pending") return 0;
  if (status === "Placed") return 0;
  if (status === "Accepted") return 1;
  if (status === "Preparing") return 2;
  if (status === "Ready") return 3;
  if (status === "Completed") return 4;
  return -1; // Cancelled
}

export default function OrderStatus({
  isOpen,
  onClose,
  orders = [],
  loading,
  onRefresh,
  onCancelOrder,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="orders-modal"
        onClick={(e) => e.stopPropagation()}
        aria-label="My Canteen Orders"
      >
        <div className="modal-header">
          <div className="modal-header-title">
            <ShoppingBag size={22} className="text-primary" />
            <h2>My Orders & Live Tracking</h2>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="refresh-btn"
              onClick={onRefresh}
              title="Refresh order status"
              disabled={loading}
            >
              <RefreshCw size={17} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="close-drawer-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {loading && orders.length === 0 ? (
            <div className="loading-state">
              <LoaderCircle size={32} className="spin text-primary" />
              <p>Fetching your orders from the kitchen...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-orders-state">
              <div className="empty-cart-icon">🍽️</div>
              <h3>No orders placed yet</h3>
              <p>Whenever you pre-order, your token and live cooking status will appear here.</p>
            </div>
          ) : (
            <div className="orders-stack">
              {orders.map((order) => {
                const stageIdx = getStageIndex(order.status);
                const isCancelled = order.status === "Cancelled";
                const isReady = order.status === "Ready";
                const canCancel =
                  ["Placed", "Pending", "Accepted"].includes(order.status);

                return (
                  <div
                    key={order._id}
                    className={`order-card ${isReady ? "order-ready-glow" : ""} ${
                      isCancelled ? "order-cancelled" : ""
                    }`}
                  >
                    {/* Order Meta Header */}
                    <div className="order-meta-header">
                      <div className="token-block">
                        <span className="order-token-label">TOKEN / ORDER ID</span>
                        <span className="order-token-id">
                          #{order._id?.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <div className="meta-right">
                        <span className="order-time">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className={`status-badge-pill ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                        <span style={{
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.72rem",
                          fontWeight: "700"
                        }}>
                          ✓ Paid (GPay UPI)
                        </span>
                      </div>
                    </div>

                    {/* Ready Banner */}
                    {isReady && (
                      <div className="ready-alert-banner">
                        <PackageCheck size={20} />
                        <div>
                          <strong>Your meal is ready!</strong> Please show Token #{order._id?.slice(-6).toUpperCase()} at the counter to collect.
                        </div>
                      </div>
                    )}

                    {/* Progress Tracker (if not cancelled) */}
                    {!isCancelled ? (
                      <div className="status-stepper">
                        {STAGES.map((step, idx) => {
                          const isDone = stageIdx >= idx;
                          const isCurrent = stageIdx === idx;
                          const Icon = step.icon;

                          return (
                            <div
                              key={step.key}
                              className={`step-item ${isDone ? "done" : ""} ${
                                isCurrent ? "current" : ""
                              }`}
                            >
                              <div className="step-circle">
                                <Icon size={14} />
                              </div>
                              <span className="step-label">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="cancelled-banner">
                        <XCircle size={18} />
                        <span>
                          Order was cancelled.{" "}
                          {order.cancellationReason && `Reason: ${order.cancellationReason}`}
                        </span>
                      </div>
                    )}

                    {/* Items Summary */}
                    <div className="order-items-box">
                      <div className="order-items-title">Items Ordered</div>
                      <div className="order-items-grid">
                        {(order.items || []).map((it, idx) => {
                          const name =
                            it.nameSnapshot ||
                            it.productId?.name ||
                            "Canteen Dish";
                          const price = it.priceSnapshot || it.price || 0;
                          return (
                            <div key={idx} className="order-item-chip">
                              <span className="item-qty-tag">{it.quantity}x</span>
                              <span className="item-name-tag">{name}</span>
                              <span className="item-price-tag">₹{price * it.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer / Total & Actions */}
                    <div className="order-footer-row">
                      <div className="pickup-info">
                        <span className="pickup-label">Pickup Slot:</span>
                        <span className="pickup-val">
                          {order.pickupSlot || "Immediate"}
                        </span>
                      </div>

                      <div className="total-and-action">
                        <div className="order-total-amount">
                          <span>Total Paid:</span>
                          <strong>₹{order.totalAmount}</strong>
                        </div>

                        {canCancel && (
                          <button
                            type="button"
                            className="cancel-order-btn"
                            onClick={() => onCancelOrder(order._id)}
                            title="Cancel this order before preparation begins"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
