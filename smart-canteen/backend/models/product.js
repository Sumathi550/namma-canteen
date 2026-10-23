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

// Pre-save hook to synchronize available & isAvailable, image & imageUrl
productSchema.pre("save", function () {
  if (this.isModified("available")) {
    this.isAvailable = this.available;
  } else if (this.isModified("isAvailable")) {
    this.available = this.isAvailable;
  }

  if (!this.imageUrl && this.image) {
    this.imageUrl = this.image;
  } else if (!this.image && this.imageUrl) {
    this.image = this.imageUrl;
  }
});

module.exports = mongoose.model("Product", productSchema);