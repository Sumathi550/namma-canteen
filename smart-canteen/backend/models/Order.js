const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  nameSnapshot: {
    type: String,
    default: "",
  },
  priceSnapshot: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  lineTotal: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    pickupSlot: {
      type: String,
      default: "Immediate (10-15 mins)",
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Placed",
        "Accepted",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled",
        "Pending", // backwards compatible
      ],
      default: "Placed",
    },
    paymentStatus: {
      type: String,
      enum: ["Pay on Pickup", "Pending", "Paid"],
      default: "Paid",
    },
    paymentMethod: {
      type: String,
      default: "Google Pay / UPI",
    },
    paymentRef: {
      type: String,
      default: "",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);