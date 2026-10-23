import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  ShoppingCart,
  User,
  LogOut,
  ClipboardList,
  Sparkles,
  Flame,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({
  cartCount = 0,
  onOpenCart,
  onOpenOrders,
  onOpenAuth,
  canteenSettings,
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const isOpen = canteenSettings?.isOpen !== false && canteenSettings?.orderAcceptance !== false;

  return (
    <header className="canteen-nav">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand-group">
          <Link to="/" className="brand-logo" title="Namma Canteen - Home">
            <div className="logo-badge">
              <UtensilsCrossed size={22} />
            </div>
            <div className="logo-text">
              <div className="logo-title-row">
                <span className="logo-title">Namma<span>Canteen</span></span>
                <span className="logo-tamil-badge">நம்ம கேன்டீன்</span>
              </div>
              <span className="logo-sub">TAMIL NADU CAMPUS FOOD HUB</span>
            </div>
          </Link>

          {/* Canteen Status Badge */}
          <div className={`status-pill ${isOpen ? "open" : "closed"}`}>
            <span className="status-dot"></span>
            <span>{isOpen ? "Kitchen Open • Accepting Pre-Orders" : "Orders Paused"}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Orders Button */}
          <button
            type="button"
            className="nav-btn ghost"
            onClick={onOpenOrders}
            title="View Live Kitchen Orders & Digital Tokens"
          >
            <ClipboardList size={18} />
            <span className="btn-label">My Orders</span>
          </button>

          {/* Cart Button */}
          <button
            type="button"
            className="nav-btn primary cart-btn"
            onClick={onOpenCart}
            title="View Cart Tray & Checkout"
          >
            <ShoppingCart size={18} />
            <span className="btn-label">Order Tray</span>
            {cartCount > 0 && (
              <span className="cart-badge animate-pop">{cartCount}</span>
            )}
          </button>

          {/* User Auth Info */}
          {isAuthenticated ? (
            <div className="user-profile-widget">
              <div className="avatar-chip" title={user.email}>
                <User size={15} />
                <span className="user-name">{user.name?.split(" ")[0] || "Student"}</span>
              </div>
              <button
                type="button"
                className="logout-icon-btn"
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="nav-btn outline auth-btn"
              onClick={onOpenAuth}
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
