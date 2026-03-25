const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
require("dotenv").config();
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATION (Senior Backend Engineer requirement)
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`ADMIN LOGIN FAIL: Email not found: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (admin.isLocked) {
      return res.status(423).json({ error: "Admin account locked. Reset via database or wait 15m." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= 5) {
        admin.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await admin.save();
      console.log(`ADMIN LOGIN FAIL: Password mismatch for: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id.toString(), role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`ADMIN LOGIN SUCCESS: ${email}`);
    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: "admin"
      }
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ 
        error: "Internal server error", 
        details: err.message, 
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined 
    });
  }
});

// GET dashboard stats (Admin Protected)
router.get("/dashboard-stats", adminMiddleware, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // Calculate revenue from paid or delivered orders
    const orders = await Order.find({
      $or: [{ paymentStatus: "Paid" }, { orderStatus: "Delivered" }]
    });

    const totalRevenue = orders.reduce((acc, order) => {
      return acc + (Number(order.totalAmount) || 0);
    }, 0);

    // Get 5 most recent orders for summary table
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      recentOrders
    });
  } catch (err) {
    console.error("Dashboard stats error", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
