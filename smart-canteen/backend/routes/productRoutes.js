const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Product = require("../models/product");
const { authenticateToken, requireAdmin, optionalAuth } = require("../middleware/auth");
const { upload, uploadDir, syncFileToPublicDirs } = require("../middleware/upload");

const router = express.Router();

// Fallback images for common Tamil Nadu canteen items if image URL is empty
const DEFAULT_IMAGES = {
  dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
  roast: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
  idli: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  vada: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  pongal: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  poori: "/images/food/poori_masala.jpg",
  meals: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
  sambar: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
  curd: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  thayir: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  lemon: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
  biryani: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  biriyani: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  parotta: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  kothu: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
  rice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
  "chicken 65": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=800&q=80",
  chicken: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
  puff: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  samosa: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  pakoda: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
  coffee: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  tea: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80",
  chai: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80",
  jigarthanda: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
  rose: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
  noodles: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
};

function assignDefaultImage(food) {
  if (food.image && food.image.trim()) return food.image;
  if (food.imageUrl && food.imageUrl.trim()) return food.imageUrl;

  const name = (food.name || "").toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_IMAGES)) {
    if (name.includes(key)) return url;
  }
  return DEFAULT_IMAGES.default;
}

// ===============================
// GET ALL FOODS (PUBLIC / FILTERED)
// GET /api/products
// ===============================
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, search, includeArchived, availableOnly } = req.query;

    const filter = {};

    // Don't show archived items to students
    if (includeArchived !== "true") {
      filter.isArchived = { $ne: true };
    }

    if (availableOnly === "true") {
      filter.$or = [{ available: true }, { isAvailable: true }];
    }

    if (category && category !== "All") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    const formatted = products.map((p) => {
      const obj = p.toObject();
      const resolvedImg = assignDefaultImage(obj);
      return {
        ...obj,
        id: obj._id,
        image: resolvedImg,
        imageUrl: resolvedImg,
        available: obj.available !== false && obj.isAvailable !== false,
        isAvailable: obj.available !== false && obj.isAvailable !== false,
      };
    });

    res.status(200).json({
      message: "Foods fetched successfully",
      products: formatted,
    });
  } catch (error) {
    console.error("Fetch products error:", error.message);
    res.status(500).json({
      message: "Failed to fetch foods",
      error: error.message,
    });
  }
});

// ===============================
// GET PRODUCT BY ID
// GET /api/products/:id
// ===============================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product || product.isArchived) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const obj = product.toObject();
    const resolvedImg = assignDefaultImage(obj);

    res.status(200).json({
      product: {
        ...obj,
        id: obj._id,
        image: resolvedImg,
        imageUrl: resolvedImg,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch food item",
      error: error.message,
    });
  }
});

// ===============================
// UPLOAD FOOD IMAGE FROM SYSTEM
// POST /api/products/upload-image
// ===============================
router.post(
  "/upload-image",
  authenticateToken,
  requireAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Failed to upload image" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      // 1. Multipart file upload from system
      if (req.file) {
        const imageRelativePath = `/images/food/${req.file.filename}`;
        syncFileToPublicDirs(req.file.path, req.file.filename);

        return res.status(200).json({
          message: "Image uploaded successfully",
          imageUrl: imageRelativePath,
          image: imageRelativePath,
          filename: req.file.filename,
        });
      }

      // 2. Base64 fallback upload
      const { imageBase64, originalName } = req.body || {};
      if (imageBase64 && typeof imageBase64 === "string" && imageBase64.includes("base64,")) {
        const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ message: "Invalid base64 image data" });
        }

        const ext = matches[1] === "jpeg" ? ".jpg" : `.${matches[1]}`;
        const buffer = Buffer.from(matches[2], "base64");
        const cleanName = (originalName || "upload").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
        const filename = `food_${cleanName}_${Date.now()}_${Math.round(Math.random() * 1e5)}${ext}`;
        const targetPath = path.join(uploadDir, filename);

        fs.writeFileSync(targetPath, buffer);
        syncFileToPublicDirs(targetPath, filename);

        const imageRelativePath = `/images/food/${filename}`;
        return res.status(200).json({
          message: "Base64 image uploaded successfully",
          imageUrl: imageRelativePath,
          image: imageRelativePath,
          filename,
        });
      }

      return res.status(400).json({ message: "No image file or base64 data provided." });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Image upload failed", error: error.message });
    }
  }
);

// ===============================
// ADD A NEW FOOD (ADMIN ONLY)
// POST /api/products
// ===============================
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, image, imageUrl, description, isVeg, stock } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Food name is required" });
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }

    const chosenImage = (image || imageUrl || "").trim();

    const product = new Product({
      name: name.trim(),
      price: numericPrice,
      category: category.trim(),
      image: chosenImage,
      imageUrl: chosenImage,
      description: (description || "").trim(),
      isVeg: isVeg !== false,
      stock: Number(stock) >= 0 ? Number(stock) : 50,
      available: true,
      isAvailable: true,
      isArchived: false,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: "Food added successfully",
      product: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add food",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE A FOOD (ADMIN ONLY)
// PUT /api/products/:id
// ===============================
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    const { name, price, category, image, imageUrl, description, available, isAvailable, isVeg, stock } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (category) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      updates.price = numericPrice;
    }

    if (image !== undefined || imageUrl !== undefined) {
      const img = (image || imageUrl || "").trim();
      updates.image = img;
      updates.imageUrl = img;
    }

    if (available !== undefined || isAvailable !== undefined) {
      const isAvail = available !== undefined ? Boolean(available) : Boolean(isAvailable);
      updates.available = isAvail;
      updates.isAvailable = isAvail;
    }

    if (isVeg !== undefined) updates.isVeg = Boolean(isVeg);
    if (stock !== undefined && !Number.isNaN(Number(stock))) updates.stock = Number(stock);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
      message: "Food updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update food",
      error: error.message,
    });
  }
});

// ===============================
// TOGGLE AVAILABILITY (ADMIN ONLY)
// PATCH /api/products/:id/availability
// ===============================
router.patch("/:id/availability", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const nextState = req.body.available !== undefined 
      ? Boolean(req.body.available) 
      : !(product.available && product.isAvailable);

    product.available = nextState;
    product.isAvailable = nextState;
    await product.save();

    res.status(200).json({
      message: `Product marked as ${nextState ? "Available" : "Sold Out"}`,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update availability",
      error: error.message,
    });
  }
});

// ===============================
// SAFE ARCHIVE / DELETE FOOD (ADMIN ONLY)
// DELETE /api/products/:id
// ===============================
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid food ID" });
    }

    // Soft delete / archive to keep historical orders intact
    const archivedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, available: false, isAvailable: false },
      { new: true }
    );

    if (!archivedProduct) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
      message: "Food archived safely",
      product: archivedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to archive food",
      error: error.message,
    });
  }
});

module.exports = router;