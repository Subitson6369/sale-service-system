const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const secret = process.env.JWT_SECRET || "fallback-secret";
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// 🔹 Admin Only Middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied. Admin Only." });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
