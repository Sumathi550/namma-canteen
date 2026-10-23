
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// API Routes
try {
  const productRoutes = require("./routes/productRoutes");
  const userRoutes = require("./routes/userRoutes");
  const orderRoutes = require("./routes/orderRoutes");
  const adminRoutes = require("./routes/adminRoutes");

  app.use("/api/products", productRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
} catch (error) {
  console.error("❌ Failed to load API routes:");
  console.error(error.stack);
  process.exit(1);
}

// Home route
app.get("/", (req, res) => {
  res.send("Smart Canteen Backend Running 🚀");
});

// Public Settings route
app.get("/api/settings", async (req, res) => {
  try {
    const Settings = require("./models/Settings");
    const settings = await Settings.getSettings();
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings", error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Smart Canteen API is running",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected",
  });
});

// Connect MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully ✅");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Backend startup failed:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
