const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// Verify JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to continue",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "Authentication configuration error: JWT_SECRET missing",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Invalid or expired token. Please log in again.",
      });
    }

    if (!decoded.userId || !mongoose.isValidObjectId(decoded.userId)) {
      return res.status(401).json({
        message: "Invalid authentication token payload",
      });
    }

    req.user = decoded;
    next();
  });
}

// Require Admin Role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
}

// Optional Auth (for routes that can be public or personalized)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!process.env.JWT_SECRET) return next();

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (!error && decoded && decoded.userId) {
      req.user = decoded;
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
};
