const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

// admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email, password });

  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ message: "Login successful" });
});

// GET dashboard stats
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

router.get("/dashboard-stats", async (req, res) => {
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
