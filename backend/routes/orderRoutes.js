const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

// 1️⃣ CREATE ORDER + VALIDATE + REDUCE STOCK (SAFE)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    // ... rest of code
    console.log("RECEIVED ITEMS:", JSON.stringify(items, null, 2));

    // 🔍 STEP 1: STOCK VALIDATION
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          error: "Product not found"
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          error: `Only ${product.stock} items available for ${product.name}`
        });
      }
    }

    // 💾 STEP 2: SAVE ORDER
    const orderData = { ...req.body, userId: req.user._id };
    orderData.orderHistory = [{ status: "Placed", date: Date.now() }];
    const order = new Order(orderData);
    await order.save();

    // 🔻 STEP 3: REDUCE STOCK (AFTER SUCCESSFUL ORDER)
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to place order"
    });
  }
});

// 2️⃣ GET ALL ORDERS (ADMIN)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 3️⃣ UPDATE ORDER STATUS (ADMIN) + AUTO MARK PAID
router.put("/:id", async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const updateData = {
      orderStatus,
      $push: { orderHistory: { status: orderStatus, date: Date.now() } }
    };

    // ✅ Auto mark payment as Paid when Delivered
    if (orderStatus === "Delivered") {
      updateData.paymentStatus = "Paid";
    }

    // ✅ Allow explicit paymentStatus updates if sent
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to update order"
    });
  }
});


// 4️⃣ GET CURRENT USER'S ORDERS (PROTECTED)
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

// 5️⃣ GET ORDERS BY USER (CUSTOMER HISTORY) - LEGACY SUPPORT
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

// 5️⃣ GET SINGLE ORDER (INVOICE) — MUST BE LAST
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;
