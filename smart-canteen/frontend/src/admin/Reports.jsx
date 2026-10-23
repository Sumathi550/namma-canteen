import React from "react";
import {
  Download,
  TrendingUp,
  Award,
  AlertTriangle,
  IndianRupee,
  ShoppingBag,
  Calendar,
} from "lucide-react";

export default function Reports({ reports, loading }) {
  const r = reports || {
    daily: { revenue: 0, count: 0 },
    weekly: { revenue: 0, count: 0 },
    monthly: { revenue: 0, count: 0 },
    statusBreakdown: [],
    bestSellers: [],
    cancelledOrders: [],
  };

  function exportCSV() {
    if (!r.bestSellers || r.bestSellers.length === 0) {
      alert("No sales data available to export.");
      return;
    }

    const rows = [
      ["Rank", "Dish Name", "Units Sold", "Total Revenue (INR)"],
      ...r.bestSellers.map((item, idx) => [
        idx + 1,
        `"${item.name || "Item"}"`,
        item.unitsSold,
        item.revenue,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smart_canteen_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="admin-reports-view">
      {/* Header with CSV Export */}
      <div className="admin-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Canteen Financial & Performance Reports</h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Revenue excludes cancelled orders. Real-time aggregated statistics from MongoDB.
            </span>
          </div>

          <button
            type="button"
            className="btn-sm primary"
            onClick={exportCSV}
            title="Download CSV sales report"
          >
            <Download size={15} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Revenue Periods Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Today's Revenue</span>
            <span className="kpi-value">₹{r.daily?.revenue || 0}</span>
            <span className="kpi-subtext">{r.daily?.count || 0} fulfilled orders</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap blue">
            <Calendar size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Past 7 Days Revenue</span>
            <span className="kpi-value">₹{r.weekly?.revenue || 0}</span>
            <span className="kpi-subtext">{r.weekly?.count || 0} fulfilled orders</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Past 30 Days Revenue</span>
            <span className="kpi-value">₹{r.monthly?.revenue || 0}</span>
            <span className="kpi-subtext">{r.monthly?.count || 0} fulfilled orders</span>
          </div>
        </div>
      </div>

      {/* 2 Columns: Best Sellers & Status Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Best Selling Dishes */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Top Selling Dishes</h3>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Ranked by customer demand</span>
            </div>
            <Award size={20} color="#ea580c" />
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Dish Name</th>
                  <th>Units Sold</th>
                  <th>Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {r.bestSellers?.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>
                      No dish order data yet.
                    </td>
                  </tr>
                ) : (
                  r.bestSellers.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: idx === 0 ? "#ea580c" : idx === 1 ? "#3b82f6" : "#64748b",
                          }}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td>
                        <strong>{item.name || "Canteen Item"}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{item.unitsSold} plates</span>
                      </td>
                      <td>
                        <strong style={{ color: "#16a34a" }}>₹{item.revenue}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Orders by Status</h3>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Volume breakdown across all orders</span>
            </div>
            <ShoppingBag size={20} color="#3b82f6" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
            {r.statusBreakdown?.map((st, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className={`status-badge ${st._id?.toLowerCase()}`}>{st._id}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "1rem" }}>{st.count} orders</strong>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>
                    Total: ₹{st.totalRevenue || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancelled Orders Breakdown */}
      {r.cancelledOrders && r.cancelledOrders.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ color: "#dc2626" }}>
                Cancelled Orders Audit
              </h3>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                Review reasons for cancellation and policy compliance
              </span>
            </div>
            <AlertTriangle size={20} color="#dc2626" />
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Token ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Cancellation Reason</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {r.cancelledOrders.map((co) => (
                  <tr key={co._id}>
                    <td>
                      <strong style={{ color: "#ea580c" }}>
                        #{co._id?.slice(-6).toUpperCase()}
                      </strong>
                    </td>
                    <td>{co.userId?.name || "Student"}</td>
                    <td>₹{co.totalAmount}</td>
                    <td>
                      <span style={{ color: "#dc2626", fontWeight: 500 }}>
                        {co.cancellationReason || "No reason specified"}
                      </span>
                    </td>
                    <td>{new Date(co.updatedAt || co.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
