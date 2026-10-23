import React, { useState, useEffect } from "react";
import { Sliders, Volume2, Clock, CheckCircle, Save, RefreshCw, Power } from "lucide-react";
import { staffApi } from "../services/api";

export default function CanteenSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await staffApi.getSettings();
      setSettings(res.settings || {});
    } catch (err) {
      console.error("Failed to load canteen settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await staffApi.updateSettings(settings);
      setSettings(res.settings || settings);
      setMsg("Canteen controls and announcement updated successfully! ✅");
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="staff-page-container">
        <div className="empty-state-box">
          <RefreshCw size={36} className="animate-spin" />
          <p>Loading Canteen Controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            <Sliders size={28} style={{ color: "#ea580c" }} />
            <span>Canteen Master Controls</span>
          </h1>
          <p className="page-header-sub">
            Toggle canteen operational state, pause orders, and broadcast campus announcements.
          </p>
        </div>

        <button
          type="button"
          className="icon-toggle-btn"
          onClick={loadSettings}
        >
          <RefreshCw size={16} />
          <span>Reload</span>
        </button>
      </div>

      {msg && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid #22c55e",
            color: "#86efac",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            fontWeight: 600
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
          {/* Operational Toggles Card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem"
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Power size={20} style={{ color: "#fb923c" }} />
              <span>Operational Switches</span>
            </h3>

            {/* Master Open / Close */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "10px",
                marginBottom: "1rem"
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Canteen Kitchen State</div>
                <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                  {settings.isOpen ? "Canteen is OPEN for business" : "Canteen is currently CLOSED"}
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.isOpen !== false}
                  onChange={(e) => setSettings({ ...settings, isOpen: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Order Acceptance */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "10px"
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pre-Order Acceptance</div>
                <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                  {settings.orderAcceptance ? "Accepting incoming student pre-orders" : "Kitchen is busy: Orders temporarily paused"}
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.orderAcceptance !== false}
                  onChange={(e) => setSettings({ ...settings, orderAcceptance: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Timings Card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem"
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={20} style={{ color: "#60a5fa" }} />
              <span>Service Timings</span>
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Opening Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.openingTime || "07:30 AM"}
                  onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Closing Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.closingTime || "07:00 PM"}
                  onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Canteen Display Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.canteenName || "Namma Canteen (நம்ம Canteen)"}
                onChange={(e) => setSettings({ ...settings, canteenName: e.target.value })}
              />
            </div>
          </div>

          {/* Announcement Broadcast Card */}
          <div
            style={{
              gridColumn: "span 2",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem"
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Volume2 size={20} style={{ color: "#c084fc" }} />
              <span>Campus Announcement Broadcast Bar</span>
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.84rem", marginBottom: "1rem" }}>
              This banner runs across the top of the student canteen ordering portal in real-time.
            </p>

            <div className="form-group">
              <textarea
                rows="3"
                className="form-textarea"
                value={settings.announcement || ""}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                placeholder="e.g. வணக்கம்! Welcome to Namma Canteen. Authentic Tamil Nadu flavours freshly prepared daily..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.75rem",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: saving ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 0 15px rgba(234, 88, 12, 0.4)"
              }}
            >
              <Save size={18} />
              <span>{saving ? "Saving Controls..." : "Save Canteen Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
