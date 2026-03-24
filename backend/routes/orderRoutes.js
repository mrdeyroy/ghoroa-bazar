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

    // 🔔 NOTIFY ADMIN: New order placed (after response sent)
    const io = req.app.get("io");
    if (io) {
      const customerName = req.body.customerDetails?.firstName || "A customer";
      io.to("admin_room").emit("newOrderNotification", {
        message: `New order received from ${customerName}`,
        orderId: order._id,
        userId: req.user._id.toString(),
        customerName,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
        createdAt: order.createdAt
      });
      console.log(`🔔 New order notification → admin_room | Order: ${order._id}`);
    }
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
    const orders = await Order.find()
      .populate("userId", "email name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 3️⃣ UPDATE ORDER STATUS (ADMIN) + AUTO MARK PAID + REAL-TIME EMIT
router.put("/:id", async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    // Input validation
    const validStatuses = ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"];
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 🔒 BACKEND LOCK: Cancelled orders are strictly read-only and cannot be modified further
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Cancelled orders cannot be updated" });
    }

    order.orderStatus = orderStatus;
    order.orderHistory.push({ status: orderStatus, date: Date.now() });

    // ✅ Auto mark payment as Paid when Delivered
    if (orderStatus === "Delivered") {
      order.paymentStatus = "Paid";
    }

    // ✅ Allow explicit paymentStatus updates if sent
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ⚡ REAL-TIME: Emit order tracking update to user (MyOrders stepper)
    const io = req.app.get("io");
    if (io && updatedOrder.userId) {
      // Tracking update (MyOrders page stepper)
      io.to(`user_${updatedOrder.userId.toString()}`).emit("orderStatusUpdate", updatedOrder);

      // 🔔 Notification toast (global, shown on any page)
      const statusMessages = {
        Packed: "Your order is being packed with care 📦",
        Shipped: "Your order is on the way! 🚚",
        Delivered: "Your order has been delivered! 🎉",
        Cancelled: "Your order has been cancelled ❌"
      };
      io.to(`user_${updatedOrder.userId.toString()}`).emit("orderNotification", {
        message: statusMessages[orderStatus] || `Your order status: ${orderStatus}`,
        orderId: updatedOrder._id,
        status: orderStatus
      });

      console.log(`⚡ Real-time update → user_${updatedOrder.userId} | Order: ${updatedOrder._id} → ${orderStatus}`);
    }

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

// 6️⃣ CANCEL ORDER (USER)
router.put("/cancel/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Ensure only the owner can cancel
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to cancel this order" });
    }

    // Business Logic: Can only cancel if Placed or Packed
    if (["Shipped", "Delivered", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ error: "Order cannot be cancelled at this stage" });
    }

    if (["Placed", "Packed"].includes(order.orderStatus)) {
      order.orderStatus = "Cancelled";
      order.cancelledAt = Date.now();
      order.orderHistory.push({ status: "Cancelled", date: Date.now() });
      await order.save();

      // Emit real-time notification to admin
      const io = req.app.get("io");
      if (io) {
        io.to("admin_room").emit("orderCancelled", order);
        console.log(`⚡ Real-time order cancelled → admin_room | Order: ${order._id}`);
      }

      return res.json({ message: "Order cancelled successfully", order });
    }

    return res.status(400).json({ error: "Invalid status for cancellation" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

// 7️⃣ GET SINGLE ORDER (INVOICE) — MUST BE LAST
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;
