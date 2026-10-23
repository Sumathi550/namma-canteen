import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Sparkles,
  Clock,
  Volume2,
  Utensils,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Flame,
  Coffee,
  Heart,
  Award,
} from "lucide-react";
import Navbar from "./components/Navbar";
import FoodCard from "./components/FoodCard";
import Cart from "./components/Cart";
import OrderStatus from "./components/OrderStatus";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import "./App.css";

const CATEGORIES = [
  { id: "All", name: "All Dishes", tamil: "அனைத்தும்", icon: "✨" },
  { id: "Tiffin Specials", name: "Tiffin Specials", tamil: "காலை டிபன்", icon: "🫓" },
  { id: "Meals & Rice", name: "Meals & Rice", tamil: "மதிய உணவு", icon: "🍛" },
  { id: "Parotta & Biriyani", name: "Parotta & Biriyani", tamil: "பரோட்டா & பிரியாணி", icon: "🥘" },
  { id: "Evening Snacks", name: "Evening Snacks", tamil: "மாலை சிற்றுண்டி", icon: "🥟" },
  { id: "Beverages & Coolers", name: "Beverages & Coolers", tamil: "பானங்கள்", icon: "☕" },
];

export default function StudentApp() {
  const { user, isAuthenticated } = useAuth();

  // State
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState("All"); // All, Veg, Non-Veg

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("canteenCart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Settings & announcements
  const [settings, setSettings] = useState(null);

  // Notifications toast
  const [toast, setToast] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("canteenCart", JSON.stringify(cart));
  }, [cart]);

  // Load initial data & listen for admin menu changes
  useEffect(() => {
    loadMenu();
    loadSettings();

    // Listen for immediate events from Admin or other tabs
    const handleMenuSync = () => {
      loadMenu();
    };

    window.addEventListener("canteen-menu-updated", handleMenuSync);
    window.addEventListener("storage", (e) => {
      if (e.key === "canteenLastMenuUpdate") {
        handleMenuSync();
      }
    });

    // Auto-refresh menu every 8 seconds for real-time kitchen/admin changes
    const menuInterval = setInterval(() => {
      loadMenu();
    }, 8000);

    return () => {
      window.removeEventListener("canteen-menu-updated", handleMenuSync);
      clearInterval(menuInterval);
    };
  }, []);

  // Poll orders when orders modal is open and user is logged in
  useEffect(() => {
    if (isOrdersOpen && isAuthenticated) {
      loadMyOrders();
      const interval = setInterval(() => {
        loadMyOrders(true);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isOrdersOpen, isAuthenticated]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  async function loadMenu() {
    setLoadingFoods(true);
    try {
      const res = await api.getProducts();
      setFoods(res.products || []);
    } catch (err) {
      console.error("Failed to load menu:", err);
      showToast("Unable to load menu. Check if backend is running.", "error");
    } finally {
      setLoadingFoods(false);
    }
  }

  async function loadSettings() {
    try {
      const res = await api.getPublicSettings();
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.warn("Could not load settings:", err);
    }
  }

  async function loadMyOrders(silent = false) {
    if (!isAuthenticated) return;
    if (!silent) setOrdersLoading(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  }

  // Cart operations
  function handleAddToCart(food) {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === food._id);
      if (existing) {
        return prev.map((item) =>
          item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...food, quantity: 1 }];
    });
    showToast(`Added "${food.name}" to your tray!`);
  }

  function handleUpdateQuantity(foodId, newQty) {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter((item) => item._id !== foodId);
      }
      return prev.map((item) =>
        item._id === foodId ? { ...item, quantity: newQty } : item
      );
    });
  }

  function handleClearCart() {
    setCart([]);
  }

  async function handlePlaceOrder(orderPayload) {
    setPlacingOrder(true);
    try {
      const res = await api.createOrder(orderPayload);
      showToast("🎉 Order placed successfully! Your kitchen token is ready.");
      setCart([]);
      setIsCartOpen(false);
      setIsOrdersOpen(true);
      loadMyOrders();
    } catch (err) {
      showToast(err.message || "Failed to place order.", "error");
    } finally {
      setPlacingOrder(false);
    }
  }

  async function handleCancelOrder(orderId) {
    try {
      await api.cancelOrder(orderId, "Cancelled by student");
      showToast("Order cancelled successfully.", "info");
      loadMyOrders();
    } catch (err) {
      showToast(err.message || "Could not cancel order.", "error");
    }
  }

  // Filtered menu
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Category filter
      if (selectedCategory !== "All") {
        const cat = (food.category || "").toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (cat !== sel && !cat.includes(sel.replace(" specials", ""))) return false;
      }

      // Veg / Non-Veg filter
      if (dietFilter === "Veg" && food.isVeg === false) return false;
      if (dietFilter === "Non-Veg" && food.isVeg === true) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = food.name?.toLowerCase().includes(q);
        const matchCat = food.category?.toLowerCase().includes(q);
        const matchDesc = food.description?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      return true;
    });
  }, [foods, selectedCategory, dietFilter, search]);

  const cartCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  // Live feature dishes for highlight strip
  const featuredBestseller = useMemo(() => {
    return foods.find((f) => f.name?.toLowerCase().includes("ghee roast")) || foods[0];
  }, [foods]);

  return (
    <div className="student-app-root">
      {/* Top Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => {
          if (!isAuthenticated) {
            setAuthMode("login");
            setIsAuthOpen(true);
          } else {
            setIsOrdersOpen(true);
          }
        }}
        onOpenAuth={() => {
          setAuthMode("login");
          setIsAuthOpen(true);
        }}
        canteenSettings={settings}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Announcement Banner with Tamil greeting */}
      {settings?.announcement && (
        <aside className="announcement-bar" aria-label="Canteen announcement">
          <div className="announcement-content">
            <Volume2 size={16} className="announcement-icon" />
            <span>{settings.announcement}</span>
          </div>
        </aside>
      )}

      {/* Hero Showcase with Tamil Nadu Canteen Aesthetic */}
      <section className="hero-banner">
        <div className="hero-container">
          <div className="hero-left-col">
            <div className="hero-tag">
              <Sparkles size={16} />
              <span>🌾 AUTHENTIC TAMIL NADU CAMPUS FOOD HUB</span>
            </div>
            <h1 className="hero-headline">
              Namma Canteen<br />
              <span>நம்ம கேன்டீன் — சுவையான உணவு</span>
            </h1>
            <p className="hero-description">
              Skip the long canteen rush! Pre-order crispy Ghee Roast Dosa, hot Parotta with Salna, Thalappakatti Biryani, and Degree Filter Coffee. Get your live digital token and pick up piping hot meals in minutes!
            </p>

            <div className="hero-meta-strip">
              <div className="meta-badge">
                <Clock size={16} />
                <span>Service: {settings?.openingTime || "07:30 AM"} – {settings?.closingTime || "07:00 PM"}</span>
              </div>
              <div className="meta-badge green">
                <Utensils size={16} />
                <span>{foods.length} Fresh Live Items</span>
              </div>
              <div className="meta-badge yellow">
                <Flame size={16} />
                <span>Hot Counter Pickup: 5-10 Mins</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Featured Dish Highlight Card */}
          {featuredBestseller && (
            <div className="hero-featured-card">
              <div className="featured-card-badge">
                <Award size={14} />
                <span>TODAY'S SPECIAL</span>
              </div>
              <div className="featured-img-wrap">
                <img
                  src={featuredBestseller.imageUrl || featuredBestseller.image}
                  alt={featuredBestseller.name}
                  className="featured-dish-img"
                />
                <span className="featured-price">₹{featuredBestseller.price}</span>
              </div>
              <div className="featured-dish-info">
                <h4>{featuredBestseller.name}</h4>
                <p>Authentic crispy golden roast with pure desi ghee, fresh sambar & chutneys.</p>
                <button
                  type="button"
                  className="hero-quick-add-btn"
                  onClick={() => handleAddToCart(featuredBestseller)}
                >
                  <ShoppingCart size={16} />
                  <span>Quick Add to Tray</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Menu Section */}
      <main className="menu-container">
        {/* Search & Category Filter Controls */}
        <div className="filter-controls-card">
          <div className="search-bar-row">
            <div className="search-input-wrapper">
              <Search size={19} className="search-icon" />
              <input
                type="text"
                placeholder="Search Dosa, Idli, Parotta, Thalappakatti Biryani, Filter Coffee, Samosa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearch("")}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Diet Filter Switch */}
            <div className="diet-switch-group">
              <button
                type="button"
                className={`diet-btn ${dietFilter === "All" ? "active" : ""}`}
                onClick={() => setDietFilter("All")}
              >
                All Foods
              </button>
              <button
                type="button"
                className={`diet-btn veg ${dietFilter === "Veg" ? "active" : ""}`}
                onClick={() => setDietFilter("Veg")}
              >
                <span className="diet-symbol-mini veg"></span>
                <span>Pure Veg</span>
              </button>
              <button
                type="button"
                className={`diet-btn non-veg ${dietFilter === "Non-Veg" ? "active" : ""}`}
                onClick={() => setDietFilter("Non-Veg")}
              >
                <span className="diet-symbol-mini non-veg"></span>
                <span>Non-Veg</span>
              </button>
            </div>
          </div>

          {/* Category Tabs with Tamil Subtitles */}
          <div className="categories-scroll-row">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <div className="cat-text-wrap">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-tamil">{cat.tamil}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Items Grid */}
        <section className="food-grid-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">
                {selectedCategory === "All" ? "Today's Tamil Nadu Menu" : selectedCategory}
              </h2>
              <p className="section-subtitle">
                Showing {filteredFoods.length} freshly prepared dishes ready for kitchen pre-order
              </p>
            </div>

            <button
              type="button"
              className="refresh-menu-btn"
              onClick={loadMenu}
              disabled={loadingFoods}
              title="Refresh Menu from Kitchen"
            >
              <RefreshCw size={16} className={loadingFoods ? "spin" : ""} />
              <span>Refresh Menu</span>
            </button>
          </div>

          {loadingFoods ? (
            <div className="menu-loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="no-foods-box">
              <div className="empty-cart-icon">🔍</div>
              <h3>No dishes matched your search</h3>
              <p>Try searching for another dish or clear dietary filters to view all foods.</p>
              <button
                type="button"
                className="action-btn outline"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setDietFilter("All");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="food-cards-grid">
              {filteredFoods.map((food) => {
                const inCart = cart.find((it) => it._id === food._id);
                return (
                  <FoodCard
                    key={food._id}
                    food={food}
                    cartQuantity={inCart ? inCart.quantity : 0}
                    onAdd={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Cart Trigger for Mobile / Sticky */}
      {cartCount > 0 && (
        <aside className="floating-cart-bar" aria-label="Quick cart bar">
          <div className="floating-cart-inner">
            <div className="floating-info">
              <span className="floating-badge">{cartCount} items in tray</span>
              <span className="floating-total">
                Total: ₹
                {cart.reduce(
                  (sum, it) => sum + Number(it.price) * it.quantity,
                  0
                )}
              </span>
            </div>
            <button
              type="button"
              className="action-btn primary floating-btn"
              onClick={() => setIsCartOpen(true)}
            >
              <span>View Tray & Order</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </aside>
      )}

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        ordering={placingOrder}
        pickupSlots={settings?.pickupSlots || []}
        onOpenAuth={() => {
          setAuthMode("login");
          setIsAuthOpen(true);
        }}
      />

      {/* Order Status Modal */}
      <OrderStatus
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        loading={ordersLoading}
        onRefresh={() => loadMyOrders(false)}
        onCancelOrder={handleCancelOrder}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Footer */}
      <footer className="canteen-footer">
        <div className="footer-inner">
          <div className="footer-brand-info">
            <div className="footer-logo">
              <span>Namma Canteen</span> • <span>நம்ம கேன்டீன்</span>
            </div>
            <p>Authentic Tamil Nadu Flavours • Smart Campus Digital Food Pre-Order</p>
          </div>
          <div className="footer-links">
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) setIsOrdersOpen(true);
                else {
                  setAuthMode("login");
                  setIsAuthOpen(true);
                }
              }}
            >
              My Order Tokens
            </button>
            <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.85rem" }}>
              Fresh Campus Food • Timely Pickup
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
