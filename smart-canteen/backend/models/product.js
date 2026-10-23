const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    available: {
      type: Boolean,
      default: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    stock: {
      type: Number,
      default: 50,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize available and isAvailable
productSchema.pre("save", function (next) {
  if (this.isModified("available")) {
    this.isAvailable = this.available;
  } else if (this.isModified("isAvailable")) {
    this.available = this.isAvailable;
  }

  // Synchronize image and imageUrl
  if (!this.imageUrl && this.image) {
    this.imageUrl = this.image;
  } else if (!this.image && this.imageUrl) {
    this.image = this.imageUrl;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);