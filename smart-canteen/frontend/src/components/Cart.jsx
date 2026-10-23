import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Cart({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onClearCart,
  onPlaceOrder,
  ordering,
  pickupSlots = [],
  onOpenAuth,
}) {
  const { isAuthenticated, user } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState(
    pickupSlots[0] || "Immediate (10-15 mins)"
  );
  const [orderNotes, setOrderNotes] = useState("");
  
  // Payment View Step: 'cart' | 'gpay_qr'
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const UPI_ID = "nammacanteen@oksbi";
  const PAYEE_NAME = "Namma Canteen Campus Food Hub";

  useEffect(() => {
    if (isOpen) {
      // Generate a fresh demo UTR number when opening checkout
      const randomUtr = "UPI" + Math.floor(1000000000 + Math.random() * 9000000000);
      setUtrNumber(randomUtr);
      setPaymentSuccess(false);
      setVerifyingPayment(false);
      setCheckoutStep("cart");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const defaultSlots =
    pickupSlots.length > 0
      ? pickupSlots
      : [
          "Immediate (10-15 mins)",
          "12:30 PM - 01:00 PM (Lunch Slot 1)",
          "01:00 PM - 01:30 PM (Lunch Slot 2)",
          "04:00 PM - 04:30 PM (Snacks Break)",
        ];

  function handleProceedToPayment() {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setCheckoutStep("gpay_qr");
  }

  function handleCopyUpi() {
    navigator.clipboard?.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  }

  function handleVerifyAndSubmit() {
    if (verifyingPayment || ordering) return;

    setVerifyingPayment(true);

    // Realistic GPay verification simulation
    setTimeout(() => {
      setVerifyingPayment(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        onPlaceOrder({
          items: cart.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          pickupSlot: selectedSlot,
          paymentMethod: "Google Pay UPI",
          paymentStatus: "Paid",
          paymentRef: utrNumber || `UPI-GPAY-${Date.now().toString().slice(-6)}`,
          orderNotes,
        });
      }, 700);
    }, 1200);
  }

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${subtotal}&cu=INR&tn=${encodeURIComponent("Namma Canteen Pre-Order")}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Your Canteen Cart"
      >
        {/* ================= STEP 1: CART ITEMS & PREPARATION ================= */}
        {checkoutStep === "cart" ? (
          <>
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-title">
                <ShoppingBag size={22} className="text-primary" />
                <h2>Your Pre-Order Cart</h2>
                <span className="cart-count-badge">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={onClose}
                title="Close Cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Food Waste Prevention Policy Notice */}
            <div className="policy-notice-banner">
              <div className="policy-notice-icon">🛡️</div>
              <div className="policy-notice-text">
                <strong>Anti-Food Waste Pre-Payment Policy:</strong>
                <span>உணவு வீணாவதைத் தவிர்க்க GPay / UPI மூலம் பணம் செலுத்திய பிறகே Kitchen Token உறுதி செய்யப்படும்.</span>
              </div>
            </div>

            {/* Content */}
            {cart.length === 0 ? (
              <div className="cart-empty-state">
                <div className="empty-cart-icon">🛒</div>
                <h3>Your tray is empty</h3>
                <p>Add some delicious meals or snacks from the menu to get started!</p>
                <button
                  type="button"
                  className="action-btn primary"
                  onClick={onClose}
                >
                  Browse Campus Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item._id} className="cart-item-row">
                      <img
                        src={
                          item.imageUrl ||
                          item.image ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80"
                        }
                        alt={item.name}
                        className="cart-item-thumb"
                      />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p className="cart-item-rate">₹{item.price} each</p>
                      </div>

                      <div className="qty-control-inline small">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            onUpdateQuantity(item._id, item.quantity - 1)
                          }
                          title="Decrease"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            onUpdateQuantity(item._id, item.quantity + 1)
                          }
                          title="Increase"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="cart-item-total">
                        <span>₹{item.price * item.quantity}</span>
                        <button
                          type="button"
                          className="delete-item-btn"
                          onClick={() => onUpdateQuantity(item._id, 0)}
                          title="Remove from cart"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Options */}
                <div className="cart-options-section">
                  {/* Pickup Slot Selection */}
                  <div className="option-field">
                    <label htmlFor="pickup-slot">
                      <Clock size={16} />
                      <span>Choose Pickup Slot</span>
                    </label>
                    <select
                      id="pickup-slot"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="form-select"
                    >
                      {defaultSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Preference - Only Instant Pre-payment allowed */}
                  <div className="option-field">
                    <label>
                      <ShieldCheck size={16} />
                      <span>Required Payment Method</span>
                    </label>
                    <div className="radio-group">
                      <label className="radio-tile selected" style={{ borderColor: "#ea580c", background: "#fff7ed" }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Google Pay UPI"
                          checked={true}
                          readOnly
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 700, color: "#9a3412" }}>
                            Google Pay / PhonePe / UPI QR (Pre-Payment)
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#c2410c" }}>
                            Mandatory to prevent uncollected orders & food wastage
                          </span>
                        </div>
                      </label>

                      <label className="radio-tile disabled" style={{ opacity: 0.55, cursor: "not-allowed" }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          disabled
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ color: "#64748b", textDecoration: "line-through" }}>
                            Pay Cash on Pickup at Counter
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 600 }}>
                            ⛔ Disabled: Prevents uncollected food waste
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bill Summary Footer */}
                <div className="cart-footer">
                  <div className="bill-summary">
                    <div className="bill-row">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="bill-row">
                      <span>Canteen Convenience Fee</span>
                      <span className="text-success">FREE (₹0)</span>
                    </div>
                    <div className="bill-row grand-total">
                      <span>Grand Total</span>
                      <span className="highlight-price">₹{subtotal}</span>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <div className="auth-required-box">
                      <p>
                        <AlertCircle size={15} /> Sign in as a student to proceed to GPay pre-payment.
                      </p>
                      <button
                        type="button"
                        className="action-btn primary full-width"
                        onClick={onOpenAuth}
                      >
                        Sign In to Pay & Order
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="action-btn checkout-btn full-width"
                      disabled={ordering}
                      onClick={handleProceedToPayment}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Smartphone size={18} />
                        Pay with GPay • ₹{subtotal}
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="clear-cart-link"
                    onClick={onClearCart}
                  >
                    Clear tray
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          /* ================= STEP 2: GPAY DUMMY QR CODE PAYMENT ================= */
          <div className="gpay-payment-container">
            {/* Header */}
            <div className="drawer-header gpay-header">
              <button
                type="button"
                className="back-btn"
                onClick={() => setCheckoutStep("cart")}
                title="Back to Cart"
                disabled={verifyingPayment || ordering}
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <div className="gpay-brand-tag">
                <span className="gpay-pill">G Pay</span>
                <span className="upi-pill">UPI</span>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={onClose}
                title="Close"
                disabled={verifyingPayment || ordering}
              >
                <X size={20} />
              </button>
            </div>

            <div className="gpay-body">
              {/* Amount Showcase */}
              <div className="gpay-amount-card">
                <span className="gpay-amount-label">Amount to Pay</span>
                <div className="gpay-amount-value">₹{subtotal}</div>
                <div className="gpay-payee-info">
                  <span className="payee-name">{PAYEE_NAME}</span>
                  <div className="upi-id-badge" onClick={handleCopyUpi} title="Click to copy UPI ID">
                    <span>{UPI_ID}</span>
                    {copiedUpi ? (
                      <span className="copied-text"><Check size={13} /> Copied</span>
                    ) : (
                      <Copy size={13} />
                    )}
                  </div>
                </div>
              </div>

              {/* Dummy QR Code Card */}
              <div className="qr-card">
                <div className="qr-wrapper">
                  <img
                    src={qrCodeUrl}
                    alt={`GPay UPI QR for ₹${subtotal}`}
                    className="qr-image"
                    onError={(e) => {
                      // Fallback SVG representation if offline
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="qr-offline-fallback" style={{ display: "none" }}>
                    <QrCode size={160} color="#0f172a" />
                    <span>Scan with Google Pay</span>
                  </div>
                  <div className="qr-center-badge">
                    <span>GPay</span>
                  </div>
                </div>

                <div className="qr-instruction">
                  <p>Scan with <strong>Google Pay</strong>, PhonePe, Paytm, or any UPI app</p>
                  <div className="upi-logos-row">
                    <span className="app-badge gpay">Google Pay</span>
                    <span className="app-badge phonepe">PhonePe</span>
                    <span className="app-badge paytm">Paytm</span>
                    <span className="app-badge upi">BHIM UPI</span>
                  </div>
                </div>
              </div>

              {/* Direct UPI Mobile Link */}
              <a
                href={upiDeepLink}
                className="gpay-intent-btn"
                target="_blank"
                rel="noreferrer"
              >
                <Smartphone size={16} />
                <span>Open in Google Pay App</span>
              </a>

              {/* Verification & UTR section */}
              <div className="utr-section">
                <label htmlFor="utr-input" className="utr-label">
                  <Lock size={13} />
                  <span>UPI Transaction Ref / UTR:</span>
                </label>
                <div className="utr-input-group">
                  <input
                    id="utr-input"
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. UPI948271038294"
                    className="utr-input"
                    disabled={verifyingPayment || ordering || paymentSuccess}
                  />
                  <button
                    type="button"
                    className="auto-ref-btn"
                    onClick={() => setUtrNumber("UPI" + Math.floor(1000000000 + Math.random() * 9000000000))}
                    title="Generate new Ref ID"
                    disabled={verifyingPayment || ordering || paymentSuccess}
                  >
                    Auto
                  </button>
                </div>
              </div>

              {/* Status / Notice */}
              {paymentSuccess ? (
                <div className="payment-alert success">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>Payment Confirmed! ₹{subtotal} Received.</strong>
                    <p>Generating your digital kitchen token now...</p>
                  </div>
                </div>
              ) : verifyingPayment ? (
                <div className="payment-alert verifying">
                  <LoaderCircle size={18} className="spin" />
                  <div>
                    <strong>Verifying payment with Google Pay...</strong>
                    <p>Confirming transaction ref: {utrNumber}</p>
                  </div>
                </div>
              ) : (
                <div className="payment-alert info">
                  <ShieldCheck size={16} />
                  <span>
                    Zero Food Waste Policy: Kitchen starts preparing your food immediately once GPay payment is verified.
                  </span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="cart-footer gpay-footer">
              <button
                type="button"
                className={`action-btn gpay-submit-btn full-width ${paymentSuccess ? "success" : ""}`}
                disabled={verifyingPayment || ordering || paymentSuccess}
                onClick={handleVerifyAndSubmit}
              >
                {paymentSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Payment Verified • Pre-Order Placed!</span>
                  </>
                ) : verifyingPayment ? (
                  <>
                    <LoaderCircle size={18} className="spin" />
                    <span>Verifying GPay Payment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>I Have Paid via GPay • Confirm Order (₹{subtotal})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="cancel-payment-btn"
                onClick={() => setCheckoutStep("cart")}
                disabled={verifyingPayment || ordering}
              >
                Cancel and return to cart
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
