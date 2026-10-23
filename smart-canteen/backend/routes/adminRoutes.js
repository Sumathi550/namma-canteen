const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/Admin");
const Product = require("../models/product");
const User = require("../models/User");
const Order = require("../models/Order");
const Settings = require("../models/Settings");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { upload, uploadDir, syncFileToPublicDirs } = require("../middleware/upload");

const router = express.Router();

function generateAdminToken(adminUser) {
  return jwt.sign(
    {
      userId: adminUser._id.toString(),
      role: "admin",
      email: adminUser.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ============================
// ADMIN LOGIN
// POST /api/admin/login
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check in User collection for role === 'admin'
    let adminUser = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    let match = false;

    if (adminUser) {
      const isBcrypt = /^\$2[aby]\$/.test(adminUser.password);
      if (isBcrypt) {
        match = await bcrypt.compare(password, adminUser.password);
      } else if (adminUser.password === password) {
        match = true;
        adminUser.password = await bcrypt.hash(password, 12);
        await adminUser.save();
      }
    } else {
      // 2. Check legacy Admin collection
      const legacyAdmin = await Admin.findOne({ email: normalizedEmail });
      if (legacyAdmin) {
        const isBcrypt = /^\$2[aby]\$/.test(legacyAdmin.password);
        if (isBcrypt) {
          match = await bcrypt.compare(password, legacyAdmin.password);
        } else if (legacyAdmin.password === password) {
          match = true;
        }

        if (match) {
          // Provision into User collection
          const hashed = await bcrypt.hash(password, 12);
          adminUser = await User.findOneAndUpdate(
            { email: normalizedEmail },
            {
              name: legacyAdmin.name,
              email: normalizedEmail,
              password: hashed,
              role: "admin",
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    if (!match || !adminUser) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const token = generateAdminToken(adminUser);

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: adminUser._id,
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
      user: {
        id: adminUser._id,
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({
      message: "Admin login failed",
      error: error.message,
    });
  }
});

// ============================
// ADMIN DASHBOARD OVERVIEW
// GET /api/admin/dashboard
// ============================
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalFoods,
      outOfStockFoods,
      totalStudents,
      totalOrders,
      todayOrdersCount,
      pendingPreparingCount,
      readyPickupCount,
      salesResult,
      todaySalesResult,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments({ isArchived: { $ne: true } }),
      Product.countDocuments({
        isArchived: { $ne: true },
        $or: [{ available: false }, { isAvailable: false }],
      }),
      User.countDocuments({ role: "student" }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({
        status: { $in: ["Placed", "Pending", "Accepted", "Preparing"] },
      }),
      Order.countDocuments({ status: "Ready" }),
      // All-time eligible sales (Completed or Ready)
      Order.aggregate([
        { $match: { status: { $in: ["Completed", "Ready"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Today's eligible sales
      Order.aggregate([
        {
          $match: {
            status: { $in: ["Completed", "Ready"] },
            createdAt: { $gte: today },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("userId", "name email phone")
        .populate("items.productId", "name price category image imageUrl"),
    ]);

    const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;
    const todaySales = todaySalesResult.length > 0 ? todaySalesResult[0].total : 0;

    res.status(200).json({
      message: "Dashboard data fetched successfully",
      summary: {
        totalFoods,
        outOfStockFoods,
        totalStudents,
        totalOrders,
        todayOrdersCount,
        pendingPreparingCount,
        readyPickupCount,
        totalSales,
        todaySales,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error.message);
    res.status(500).json({
      message: "Dashboard fetch failed",
      error: error.message,
    });
  }
});

// ============================
// ADMIN ALL ORDERS WITH FILTERS
// GET /api/admin/orders
// ============================
router.get("/orders", authenticateToken, requireAdmin, async (req, res) => {
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

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error.message);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// ============================
// ADMIN UPDATE ORDER STATUS
// PATCH & PUT /api/admin/orders/:id/status
// ============================
async function updateAdminOrderStatus(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const { status, cancellationReason } = req.body;
    const allowed = ["Placed", "Accepted", "Preparing", "Ready", "Completed", "Cancelled", "Pending"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid order status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const updates = { status };
    if (status === "Cancelled" && cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )
      .populate("userId", "name email phone")
      .populate("items.productId", "name price category image imageUrl");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Admin order update error:", error.message);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
}

router.put("/orders/:id/status", authenticateToken, requireAdmin, updateAdminOrderStatus);
router.patch("/orders/:id/status", authenticateToken, requireAdmin, updateAdminOrderStatus);

// ============================
// ADMIN PRODUCTS / MENU CRUD
// GET, POST, PUT, PATCH, DELETE /api/admin/products
// ============================
router.get("/products", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find({ isArchived: { $ne: true } }).sort({ createdAt: -1 });
    const formatted = products.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        id: obj._id,
        available: obj.available !== false && obj.isAvailable !== false,
        isAvailable: obj.available !== false && obj.isAvailable !== false,
      };
    });
    res.status(200).json({
      message: "Products fetched for staff manager",
      products: formatted,
    });
  } catch (error) {
    console.error("Admin products fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// ============================
// ADMIN UPLOAD FOOD IMAGE FROM SYSTEM
// POST /api/admin/upload-image & POST /api/admin/products/upload-image
// ============================
const handleAdminImageUpload = async (req, res) => {
  try {
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
    console.error("Admin upload error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

const adminMulterMiddleware = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Failed to upload image" });
    }
    next();
  });
};

router.post("/upload-image", authenticateToken, requireAdmin, adminMulterMiddleware, handleAdminImageUpload);
router.post("/products/upload-image", authenticateToken, requireAdmin, adminMulterMiddleware, handleAdminImageUpload);

router.post("/products", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, image, imageUrl, description, isVeg, stock, available } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Food name is required" });
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) return res.status(400).json({ message: "Price must be positive" });

    const chosenImg = (image || imageUrl || "").trim();
    const product = new Product({
      name: name.trim(),
      price: numPrice,
      category: (category || "Tiffin Specials").trim(),
      image: chosenImg,
      imageUrl: chosenImg,
      description: (description || "").trim(),
      isVeg: isVeg !== false,
      stock: Number(stock) >= 0 ? Number(stock) : 50,
      available: available !== false,
      isAvailable: available !== false,
      isArchived: false,
    });

    const saved = await product.save();
    res.status(201).json({ message: "Food item created successfully", product: saved });
  } catch (error) {
    console.error("Admin product create error:", error.message);
    res.status(500).json({ message: "Failed to create food item", error: error.message });
  }
});

router.put("/products/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product ID" });
    const { name, price, category, image, imageUrl, description, isVeg, stock, available, isAvailable } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (category) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (image !== undefined || imageUrl !== undefined) {
      const img = (image || imageUrl || "").trim();
      updates.image = img;
      updates.imageUrl = img;
    }
    if (available !== undefined || isAvailable !== undefined) {
      const state = available !== undefined ? Boolean(available) : Boolean(isAvailable);
      updates.available = state;
      updates.isAvailable = state;
    }
    if (isVeg !== undefined) updates.isVeg = Boolean(isVeg);
    if (stock !== undefined && !Number.isNaN(Number(stock))) updates.stock = Number(stock);

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Food item not found" });

    res.status(200).json({ message: "Food updated successfully", product: updated });
  } catch (error) {
    console.error("Admin product update error:", error.message);
    res.status(500).json({ message: "Failed to update food item", error: error.message });
  }
});

router.patch("/products/:id/toggle", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product ID" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Food item not found" });

    const nextState = !(product.available && product.isAvailable);
    product.available = nextState;
    product.isAvailable = nextState;
    await product.save();

    res.status(200).json({ message: `Product marked as ${nextState ? "Available" : "Sold Out"}`, product });
  } catch (error) {
    console.error("Admin product toggle error:", error.message);
    res.status(500).json({ message: "Failed to toggle availability", error: error.message });
  }
});

router.patch("/products/:id/availability", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product ID" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Food item not found" });

    const nextState = req.body.available !== undefined ? Boolean(req.body.available) : !(product.available && product.isAvailable);
    product.available = nextState;
    product.isAvailable = nextState;
    await product.save();

    res.status(200).json({ message: `Product marked as ${nextState ? "Available" : "Sold Out"}`, product });
  } catch (error) {
    console.error("Admin product availability error:", error.message);
    res.status(500).json({ message: "Failed to set availability", error: error.message });
  }
});

router.delete("/products/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product ID" });
    const archived = await Product.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, available: false, isAvailable: false },
      { new: true }
    );
    if (!archived) return res.status(404).json({ message: "Food item not found" });

    res.status(200).json({ message: "Food archived safely", product: archived });
  } catch (error) {
    console.error("Admin product delete error:", error.message);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
});


// ============================
// USER DIRECTORY (ADMIN ONLY)
// GET /api/admin/users
// ============================
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    // Aggregate order metrics per user
    const userOrderStats = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Completed", "Ready"]] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = new Map();
    userOrderStats.forEach((s) => {
      if (s._id) statsMap.set(s._id.toString(), s);
    });

    const enrichedUsers = users.map((u) => {
      const stats = statsMap.get(u._id.toString()) || { orderCount: 0, totalSpent: 0 };
      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || "—",
        role: u.role,
        isActive: u.isActive !== false,
        createdAt: u.createdAt,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
      };
    });

    res.status(200).json({
      message: "Users fetched successfully",
      users: enrichedUsers,
    });
  } catch (error) {
    console.error("Users list error:", error.message);
    res.status(500).json({
      message: "Failed to fetch user list",
      error: error.message,
    });
  }
});

// ============================
// SALES REPORTS & ANALYTICS
// GET /api/admin/reports
// ============================
router.get("/reports", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);

    const [
      dailySales,
      weeklySales,
      monthlySales,
      statusBreakdown,
      bestSellers,
      cancelledOrders,
    ] = await Promise.all([
      // Today
      Order.aggregate([
        {
          $match: {
            status: { $in: ["Completed", "Ready"] },
            createdAt: { $gte: todayStart },
          },
        },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      // 7 Days
      Order.aggregate([
        {
          $match: {
            status: { $in: ["Completed", "Ready"] },
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      // 30 Days
      Order.aggregate([
        {
          $match: {
            status: { $in: ["Completed", "Ready"] },
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      // Status breakdown
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
      // Best selling items
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.nameSnapshot" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 8 },
      ]),
      // Cancelled orders breakdown
      Order.find({ status: "Cancelled" })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Populate missing dish names for best sellers if nameSnapshot was empty
    const populatedBestSellers = await Promise.all(
      bestSellers.map(async (item) => {
        if (!item.name && item._id) {
          const prod = await Product.findById(item._id);
          return { ...item, name: prod ? prod.name : "Special Dish" };
        }
        return item;
      })
    );

    res.status(200).json({
      message: "Reports fetched successfully",
      reports: {
        daily: dailySales[0] || { revenue: 0, count: 0 },
        weekly: weeklySales[0] || { revenue: 0, count: 0 },
        monthly: monthlySales[0] || { revenue: 0, count: 0 },
        statusBreakdown,
        bestSellers: populatedBestSellers,
        cancelledOrders,
      },
    });
  } catch (error) {
    console.error("Reports error:", error.message);
    res.status(500).json({
      message: "Failed to generate sales reports",
      error: error.message,
    });
  }
});

// ============================
// SETTINGS
// GET & PUT /api/admin/settings
// ============================
router.get("/settings", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings", error: error.message });
  }
});

router.put("/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const { isOpen, orderAcceptance, openingTime, closingTime, announcement, pickupSlots } = req.body;

    if (isOpen !== undefined) settings.isOpen = Boolean(isOpen);
    if (orderAcceptance !== undefined) settings.orderAcceptance = Boolean(orderAcceptance);
    if (openingTime) settings.openingTime = openingTime;
    if (closingTime) settings.closingTime = closingTime;
    if (announcement !== undefined) settings.announcement = announcement;
    if (Array.isArray(pickupSlots)) settings.pickupSlots = pickupSlots;

    await settings.save();
    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings", error: error.message });
  }
});

module.exports = router;
