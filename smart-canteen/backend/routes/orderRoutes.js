const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/product");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Valid Status Transitions
const ALLOWED_STATUSES = [
  "Placed",
  "Accepted",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
  "Pending", // backwards compatible
];

// ==============================
// PLACE ORDER (STUDENT)
// POST /api/orders
// ==============================
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items, pickupSlot, paymentMethod, paymentRef, paymentStatus } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty. Please add items to place an order.",
      });
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const productId = item.productId || item._id || item.id;
      const quantity = Number(item.quantity);

      if (
        !productId ||
        !mongoose.isValidObjectId(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return res.status(400).json({
          message: "Invalid product ID or item quantity.",
        });
      }

      const product = await Product.findById(productId);

      if (!product || product.isArchived) {
        return res.status(400).json({
          message: "One of the selected food items is no longer on the menu.",
        });
      }

      const isAvail = product.available !== false && product.isAvailable !== false;
      if (!isAvail) {
        return res.status(400).json({
          message: `"${product.name}" is currently sold out. Please remove it from your cart.`,
        });
      }

      const currentPrice = Number(product.price);
      if (!Number.isFinite(currentPrice) || currentPrice < 0) {
        return res.status(400).json({
          message: `Invalid price configuration for "${product.name}".`,
        });
      }

      const lineTotal = currentPrice * quantity;
      subtotal += lineTotal;

      verifiedItems.push({
        productId: product._id,
        nameSnapshot: product.name,
        priceSnapshot: currentPrice,
        price: currentPrice,
        quantity,
        lineTotal,
      });
    }

    // Orders placed with UPI / GPay are marked as Paid with transaction reference
    const finalPaymentStatus = paymentStatus || (paymentMethod === "Pay on Pickup" ? "Pay on Pickup" : "Paid");
    const finalPaymentMethod = paymentMethod || "Google Pay / UPI";

    const order = await Order.create({
      userId: req.user.userId,
      items: verifiedItems,
      pickupSlot: pickupSlot && String(pickupSlot).trim() ? String(pickupSlot).trim() : "Immediate (10-15 mins)",
      subtotal,
      totalAmount: subtotal,
      status: "Placed",
      paymentStatus: finalPaymentStatus,
      paymentMethod: finalPaymentMethod,
      paymentRef: paymentRef || `UPI-GPAY-${Date.now().toString().slice(-6)}`,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name price category image imageUrl");

    return res.status(201).json({
      message: "Order placed successfully!",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Place order error:", error.message);
    return res.status(500).json({
      message: "Failed to place order. Please try again.",
    });
  }
});

// ==============================
// GET MY ORDERS (STUDENT)
// GET /api/orders/my-orders
// ==============================
router.get("/my-orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate("items.productId", "name price category image imageUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Your orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Fetch my orders error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch your orders",
    });
  }
});

// ==============================
// GET ALL ORDERS (ADMIN ONLY)
// GET /api/orders
// ==============================
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    let orders = await Order.find(filter)
      .populate("userId", "name email phone")
      .populate("items.productId", "name price category image imageUrl")
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter((o) => {
        const idMatches = o._id.toString().toLowerCase().includes(q);
        const nameMatches = o.userId?.name?.toLowerCase().includes(q);
        const emailMatches = o.userId?.email?.toLowerCase().includes(q);
        return idMatches || nameMatches || emailMatches;
      });
    }

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Fetch all orders error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

// ==============================
// GET ONE ORDER (OWNER OR ADMIN)
// GET /api/orders/:id
// ==============================
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name price category image imageUrl");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderOwnerId = order.userId?._id?.toString() || order.userId?.toString();
    const isOwner = orderOwnerId === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to view this order",
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Fetch order error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch order",
    });
  }
});

// ==============================
// CANCEL ORDER (STUDENT OWNER)
// PATCH /api/orders/:id/cancel
// ==============================
router.patch("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderOwnerId = order.userId?._id?.toString() || order.userId?.toString();
    const isOwner = orderOwnerId === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only cancel your own orders",
      });
    }

    // Cancellation policy: can only cancel if Placed, Pending, or Accepted
    const cancellableStatuses = ["Placed", "Pending", "Accepted"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled because it is already in "${order.status}" status.`,
      });
    }

    order.status = "Cancelled";
    order.cancellationReason = req.body.reason || "Cancelled by customer";
    await order.save();

    const updated = await Order.findById(order._id)
      .populate("userId", "name email")
      .populate("items.productId", "name price category");

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: updated,
    });
  } catch (error) {
    console.error("Cancel order error:", error.message);
    return res.status(500).json({
      message: "Failed to cancel order",
    });
  }
});

// ==============================
// UPDATE ORDER STATUS (ADMIN ONLY)
// PUT & PATCH /api/orders/:id/status
// ==============================
async function updateStatusHandler(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const { status, cancellationReason } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid order status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const updates = { status };
    if (status === "Cancelled" && cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("userId", "name email phone")
      .populate("items.productId", "name price category image imageUrl");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: `Order status changed to "${status}"`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error.message);
    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
}

router.put("/:id/status", authenticateToken, requireAdmin, updateStatusHandler);
router.patch("/:id/status", authenticateToken, requireAdmin, updateStatusHandler);

module.exports = router;
