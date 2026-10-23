import React, { useState, useMemo } from "react";
import { Search, User, Mail, Phone, Calendar, ShoppingBag, IndianRupee } from "lucide-react";

export default function Users({ users = [], loading }) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.phone?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [users, search]);

  return (
    <div className="admin-users-view">
      {/* Search Header */}
      <div className="admin-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
            />
            <input
              type="text"
              placeholder="Search students by name, email or phone..."
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

          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Total Registered Students: <strong>{users.length}</strong>
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Registered Students Directory</h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Secure directory showing ordering history and campus profile
            </span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Joined Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
                    No students match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id || u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#e0f2fe",
                            color: "#0369a1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                        >
                          {u.name?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.92rem" }}>{u.name}</strong>
                          <span style={{ display: "block", fontSize: "0.72rem", color: "#64748b" }}>
                            Role: {u.role || "student"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "#334155" }}>
                        {u.email}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                        {u.phone || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {u.orderCount || 0} orders
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: "0.95rem", color: "#16a34a" }}>
                        ₹{u.totalSpent || 0}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: u.isActive !== false ? "#dcfce7" : "#fee2e2",
                          color: u.isActive !== false ? "#16a34a" : "#dc2626",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {u.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
