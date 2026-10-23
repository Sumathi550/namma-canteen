
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Users,
  IndianRupee,
  RefreshCw,
  Search,
  Clock3,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  XCircle,
  ArrowLeft,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import "./AdminDashboard.css";

const API = import.meta.env.VITE_API_URL || "https://namma-canteen-x1mq.onrender.com/api";

const STATUSES = [
  "Pending",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getCustomer(order) {
  const customer = order.userId;

  if (customer && typeof customer === "object") {
    return {
      name: customer.name || "Student",
      email: customer.email || "No email",
    };
  }

  return {
    name: "Student",
    email: "Customer details unavailable",
  };
}

function getItems(order) {
  if (!Array.isArray(order.items)) return [];

  return order.items.map((item) => {
    const product =
      item.productId && typeof item.productId === "object"
        ? item.productId
        : null;

    return {
      name: product?.name || "Food item",
      quantity: Number(item.quantity || 0),
      price: Number(item.price || product?.price || 0),
    };
  });
}

function getOrderAmount(order) {
  if (Number.isFinite(Number(order.totalAmount))) {
    return Number(order.totalAmount);
  }

  return getItems(order).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusIcon(status) {
  switch (status) {
    case "Pending":
      return <Clock3 size={15} />;
    case "Preparing":
      return <ChefHat size={15} />;
    case "Ready":
      return <PackageCheck size={15} />;
    case "Completed":
      return <CheckCircle2 size={15} />;
    case "Cancelled":
      return <XCircle size={15} />;
    default:
      return <Clock3 size={15} />;
  }
}

export default function AdminDashboard({ onBack }) {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, ordersResponse] = await Promise.all([
        fetch(`${API}/admin/dashboard`),
        fetch(`${API}/orders`),
      ]);

      if (!dashboardResponse.ok) {
        throw new Error(
          `Dashboard request failed (${dashboardResponse.status})`
        );
      }

      if (!ordersResponse.ok) {
        throw new Error(
          `Orders request failed (${ordersResponse.status})`
        );
      }

      const dashboardData = await dashboardResponse.json();
      const ordersData = await ordersResponse.json();

      const orderList = Array.isArray(ordersData)
        ? ordersData
        : Array.isArray(ordersData.orders)
          ? ordersData.orders
          : Array.isArray(ordersData.data)
            ? ordersData.data
            : null;

      if (!orderList) {
        throw new Error(
          "Orders API response format is not recognised."
        );
      }

      setDashboard(dashboardData.summary || {});
      setOrders(orderList);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(
        `${err.message}. Check that the backend and API routes are running.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function updateOrderStatus(orderId, newStatus) {
    const currentOrder = orders.find(
      (order) => order._id === orderId
    );

    if (!currentOrder || currentOrder.status === newStatus) return;

    const previousStatus = currentOrder.status;
    setUpdatingId(orderId);
    setNotice("");

    try {
      const response = await fetch(
        `${API}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update order status."
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setNotice(
        `Order status updated: ${previousStatus} → ${newStatus}`
      );

      // Reload server totals and the latest order data.
      try {
        const [dashboardResponse, ordersResponse] =
          await Promise.all([
            fetch(`${API}/admin/dashboard`),
            fetch(`${API}/orders`),
          ]);

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setDashboard(dashboardData.summary || {});
        }

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const refreshedOrders = Array.isArray(ordersData)
            ? ordersData
            : ordersData.orders || ordersData.data;

          if (Array.isArray(refreshedOrders)) {
            setOrders(refreshedOrders);
          }
        }
      } catch (refreshError) {
        console.error("Dashboard refresh error:", refreshError);
      }
    } catch (err) {
      console.error("Order status update error:", err);
      setNotice(`Update failed: ${err.message}`);
    } finally {
      setUpdatingId("");
    }
  }

  const filteredOrders = orders.filter((order) => {
    const customer = getCustomer(order);
    const orderId = (order._id || "").toLowerCase();

    const matchesSearch =
      orderId.includes(search.toLowerCase()) ||
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const summary = dashboard || {};

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="#admin-home">
          <span className="admin-brand-icon">
            <Utensils size={23} />
          </span>

          <span>
            <strong>Smart Canteen</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </a>

        <div className="admin-nav-label">WORKSPACE</div>

        <a className="admin-nav-item active" href="#admin-home">
          <LayoutDashboard size={18} />
          Dashboard
        </a>

        <a className="admin-nav-item" href="#admin-orders">
          <ShoppingBag size={18} />
          Order management
        </a>

        <div className="admin-sidebar-bottom">
          <div className="admin-help-icon">
            <ChefHat size={23} />
          </div>
          <strong>Canteen control</strong>
          <p>Manage orders and keep service moving.</p>

          {onBack && (
            <button className="admin-back-button" onClick={onBack}>
              <ArrowLeft size={16} />
              Back to website
            </button>
          )}
        </div>
      </aside>

      <main className="admin-main" id="admin-home">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">OVERVIEW</span>
            <h1>Admin Dashboard</h1>
            <p>Monitor canteen activity and manage incoming orders.</p>
          </div>

          <button
            className="admin-refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle className="admin-spin" size={17} />
            ) : (
              <RefreshCw size={17} />
            )}
            Refresh
          </button>
        </header>

        {notice && (
          <div className="admin-notice" role="status">
            <AlertCircle size={17} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="admin-error" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>Unable to load dashboard</strong>
              <p>{error}</p>
            </div>
            <button onClick={loadDashboard}>Retry</button>
          </div>
        )}

        <section className="admin-stats">
          <article className="admin-stat-card">
            <div className="admin-stat-top">
              <span>Total foods</span>
              <span className="admin-stat-icon orange">
                <Utensils size={20} />
              </span>
            </div>
            <strong>{summary.totalFoods ?? "—"}</strong>
            <small>Food items in the menu</small>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-top">
              <span>Total students</span>
              <span className="admin-stat-icon purple">
                <Users size={20} />
              </span>
            </div>
            <strong>{summary.totalStudents ?? "—"}</strong>
            <small>Registered student accounts</small>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-top">
              <span>Total orders</span>
              <span className="admin-stat-icon blue">
                <ShoppingBag size={20} />
              </span>
            </div>
            <strong>{summary.totalOrders ?? "—"}</strong>
            <small>Orders recorded in the system</small>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-top">
              <span>Reported sales</span>
              <span className="admin-stat-icon green">
                <IndianRupee size={20} />
              </span>
            </div>
            <strong>{money(summary.totalSales)}</strong>
            <small>Value returned by the dashboard API</small>
          </article>
        </section>

        <section className="admin-orders-section" id="admin-orders">
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">KITCHEN WORKFLOW</span>
              <h2>Order management</h2>
              <p>Review orders and update their preparation status.</p>
            </div>

            <span className="admin-order-count">
              {filteredOrders.length} orders shown
            </span>
          </div>

          <div className="admin-order-toolbar">
            <div className="admin-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer or order ID..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter orders by status"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading && orders.length === 0 ? (
            <div className="admin-loading">
              <LoaderCircle className="admin-spin" size={30} />
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-empty">
              <ShoppingBag size={35} />
              <h3>No orders found</h3>
              <p>Try a different search or status filter.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-order-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Student</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Placed at</th>
                    <th>Status</th>
                    <th>Update status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const customer = getCustomer(order);
                    const items = getItems(order);
                    const isUpdating = updatingId === order._id;

                    return (
                      <tr key={order._id}>
                        <td>
                          <strong className="admin-order-id">
                            #{(order._id || "").slice(-6).toUpperCase()}
                          </strong>
                          <small className="admin-order-full-id">
                            {order._id}
                          </small>
                        </td>

                        <td>
                          <strong>{customer.name}</strong>
                          <small>{customer.email}</small>
                        </td>

                        <td>
                          <div className="admin-items-list">
                            {items.map((item, index) => (
                              <span key={`${item.name}-${index}`}>
                                {item.name} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td>
                          <strong className="admin-order-price">
                            {money(getOrderAmount(order))}
                          </strong>
                        </td>

                        <td>
                          <span className="admin-date">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-status status-${(
                              order.status || "Pending"
                            ).toLowerCase()}`}
                          >
                            {statusIcon(order.status)}
                            {order.status || "Pending"}
                          </span>
                        </td>

                        <td>
                          <select
                            className="admin-status-select"
                            value={order.status || "Pending"}
                            disabled={
                              isUpdating ||
                              order.status === "Completed" ||
                              order.status === "Cancelled"
                            }
                            onChange={(event) =>
                              updateOrderStatus(
                                order._id,
                                event.target.value
                              )
                            }
                            aria-label={`Update order ${order._id} status`}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <LoaderCircle
                              className="admin-spin admin-inline-loader"
                              size={15}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="admin-table-note">
            Status changes are saved through the backend API. Completed
            and cancelled orders are locked in this interface.
          </p>
        </section>

        <footer className="admin-footer">
          <span>Smart Canteen Admin</span>
          <span>Order operations console</span>
        </footer>
      </main>
    </div>
  );
}
