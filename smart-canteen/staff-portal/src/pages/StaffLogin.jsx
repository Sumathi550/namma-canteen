import React, { useState } from "react";
import { UtensilsCrossed, ShieldCheck, Lock, Mail, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { useStaffAuth } from "../context/StaffAuthContext";

export default function StaffLogin() {
  const { login, loading } = useStaffAuth();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("AdminDemo123");
  const [error, setError] = useState("");

  const CANTEEN_URL = import.meta.env.VITE_CANTEEN_URL || "http://localhost:5173";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.message || "Invalid staff credentials.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top, #1e293b, #0b1120)",
        padding: "1.5rem"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "20px",
          padding: "2.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #ea580c, #f97316)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              marginBottom: "1rem",
              boxShadow: "0 0 20px rgba(234, 88, 12, 0.4)"
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", margin: 0 }}>
            Namma Canteen — Staff Portal
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Kitchen Display System (KDS) & Operations Hub
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#fca5a5",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.84rem",
              marginBottom: "1.25rem"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Staff / Admin Email</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@nammacanteen.com"
                style={{ paddingLeft: "2.4rem" }}
              />
              <Mail
                size={16}
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Staff Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ paddingLeft: "2.4rem" }}
              />
              <Lock
                size={16}
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.8rem",
              background: "linear-gradient(135deg, #ea580c, #f97316)",
              border: "none",
              borderRadius: "10px",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 0 15px rgba(234, 88, 12, 0.3)",
              transition: "all 0.2s"
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            <span>{loading ? "Authenticating..." : "Access Kitchen Portal"}</span>
          </button>
        </form>

        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid #334155",
            textAlign: "center"
          }}
        >
          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 0.75rem 0" }}>
            Looking for food order? Visit student site:
          </p>
          <a
            href={CANTEEN_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.84rem",
              color: "#fb923c",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            <UtensilsCrossed size={14} />
            <span>Open Student Canteen Portal (5173)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
