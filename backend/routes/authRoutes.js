const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sendEmail = require("../utils/email");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Send welcome email
    sendEmail(email, 'Welcome to Sales & Service System', `Hi ${name},\n\nYour account has been created successfully.\n\nLogin with your email and password.\n\nBest,\nSales & Service Team`);

    const secret = process.env.JWT_SECRET || "fallback-secret";
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      role: user.role 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "fallback-secret";
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all engineers (admin)
router.get("/engineers", async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" }).select("-password").sort({ createdAt: -1 });
    res.json(engineers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete engineer (admin)
router.delete("/engineers/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Engineer not found" });
    res.json({ message: "Engineer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

