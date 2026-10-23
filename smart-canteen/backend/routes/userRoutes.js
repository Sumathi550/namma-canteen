const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Generate JWT token
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role || "student",
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ==============================
// STUDENT REGISTER
// POST /api/users/register
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate in User collection
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered. Please log in.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? String(phone).trim() : "",
      role: "student",
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Student registered successfully",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered. Please log in.",
      });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// ==============================
// USER LOGIN (STUDENT OR ADMIN)
// POST /api/users/login
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Look in User collection first
    let user = await User.findOne({ email: normalizedEmail });
    let role = "student";

    if (user) {
      role = user.role || "student";
      const isBcrypt = /^\$2[aby]\$/.test(user.password);
      let match = false;

      if (isBcrypt) {
        match = await bcrypt.compare(password, user.password);
      } else if (user.password === password) {
        match = true;
        user.password = await bcrypt.hash(password, 12);
        await user.save();
      }

      if (!match) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
    } else {
      // 2. Fallback: check Admin collection
      const admin = await Admin.findOne({ email: normalizedEmail });
      if (admin) {
        const isBcrypt = /^\$2[aby]\$/.test(admin.password);
        let match = false;
        if (isBcrypt) {
          match = await bcrypt.compare(password, admin.password);
        } else if (admin.password === password) {
          match = true;
        }

        if (!match) {
          return res.status(401).json({
            message: "Invalid email or password",
          });
        }

        // Provision into User collection
        let syncedAdmin = await User.findOne({ email: normalizedEmail });
        if (!syncedAdmin) {
          const hashedAdminPw = await bcrypt.hash(password, 12);
          syncedAdmin = await User.create({
            name: admin.name,
            email: normalizedEmail,
            password: hashedAdminPw,
            role: "admin",
          });
        }
        user = syncedAdmin;
        role = "admin";
      } else {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
});

// ==============================
// GET CURRENT PROFILE
// GET /api/users/me
// ==============================
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch user profile",
    });
  }
});

module.exports = router;
