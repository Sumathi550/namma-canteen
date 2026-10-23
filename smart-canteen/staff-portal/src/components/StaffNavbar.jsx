import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  UtensilsCrossed,
  Flame,
  BookOpen,
  Sliders,
  BarChart3,
  Volume2,
  VolumeX,
  ExternalLink,
  LogOut,
  User,
  Radio
} from "lucide-react";
import { useStaffAuth } from "../context/StaffAuthContext";
import { soundNotifier } from "./LiveAudioNotifier";

export default function StaffNavbar({ pendingOrdersCount = 0 }) {
  const { user, logout } = useStaffAuth();
  const location = useLocation();
  const [soundEnabled, setSoundEnabled] = useState(soundNotifier.enabled);

  const CANTEEN_URL = import.meta.env.VITE_CANTEEN_URL || "http://localhost:5173";

  function handleToggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundNotifier.toggleSound(next);
  }

  return (
    <header className="staff-nav">
      <div className="staff-nav-container">
        {/* Brand */}
        <Link to="/" className="brand-section">
          <div className="brand-logo-icon">
            <UtensilsCrossed size={22} />
          </div>
          <div className="brand-titles">
            <div className="brand-name">
              Namma Canteen <span>Staff</span>
              <span className="staff-tag">KITCHEN KDS</span>
            </div>
            <div className="brand-sub">Campus Kitchen & Operations Portal</div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-tab-btn ${location.pathname === "/" ? "active" : ""}`}
            title="Live Kitchen Orders Display"
          >
            <Flame size={18} />
            <span>Live Kitchen</span>
            {pendingOrdersCount > 0 && (
              <span className="nav-badge">{pendingOrdersCount}</span>
            )}
          </Link>

          <Link
            to="/menu"
            className={`nav-tab-btn ${location.pathname === "/menu" ? "active" : ""}`}
            title="Manage Menu & Stock"
          >
            <BookOpen size={18} />
            <span>Menu & Stock</span>
          </Link>

          <Link
            to="/settings"
            className={`nav-tab-btn ${location.pathname === "/settings" ? "active" : ""}`}
            title="Canteen Open/Close & Announcements"
          >
            <Sliders size={18} />
            <span>Canteen Controls</span>
          </Link>

          <Link
            to="/analytics"
            className={`nav-tab-btn ${location.pathname === "/analytics" ? "active" : ""}`}
            title="Sales & Reports"
          >
            <BarChart3 size={18} />
            <span>Sales & Analytics</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="nav-right-actions">
          {/* Live Sync Status */}
          <div className="pulse-pill" title="Auto-polling active every 3s">
            <span className="pulse-dot"></span>
            <span>Live Kitchen Sync</span>
          </div>

          {/* Sound Alert Toggle */}
          <button
            type="button"
            className={`icon-toggle-btn ${soundEnabled ? "active" : ""}`}
            onClick={handleToggleSound}
            title={soundEnabled ? "Sound Alerts On (Click to Mute)" : "Sound Alerts Muted (Click to Enable)"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? "Sound On" : "Muted"}</span>
          </button>

          {/* External Link to Canteen Site (Port 5173) */}
          <a
            href={CANTEEN_URL}
            target="_blank"
            rel="noreferrer"
            className="external-link-btn"
            title="Open Student Ordering Portal in a new tab"
          >
            <span>Canteen Site (5173)</span>
            <ExternalLink size={14} />
          </a>

          {/* Logout */}
          <button
            type="button"
            className="logout-btn"
            onClick={logout}
            title="Sign out of Staff Portal"
          >
            <LogOut size={16} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
