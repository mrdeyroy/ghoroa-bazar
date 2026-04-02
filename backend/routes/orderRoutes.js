const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const anyAuth = require("../middleware/anyAuth");
const { sendEmail } = require("../utils/mail");

/**
 * @desc    COD OTP Email Template
 */
const codOtpTemplate = (otp) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; background: #fbfcfa;">
    <div style="background: #064734; color: #E0FFC2; padding: 30px; border-radius: 20px 20px 0 0; text-align: center;">
      <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Ghoroa Bazar</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">Verify Your COD Order</p>
    </div>
    <div style="background: #FFFDD0; padding: 40px 30px; border: 1px solid #E0FFC2; border-radius: 0 0 20px 20px; text-align: center;">
      <p style="color: #064734; font-size: 16px; margin-bottom: 25px; font-weight: 600;">Use the code below to confirm your Cash on Delivery order:</p>
      <div style="background: #064734; color: #E0FFC2; font-size: 36px; font-weight: 800; letter-spacing: 12px; text-align: center; padding: 25px; border-radius: 16px; margin: 20px 0; box-shadow: 0 8px 24px rgba(6,71,52,0.1);">
        ${otp}
      </div>
      <p style="color: #666; font-size: 13px; margin-top: 25px;">This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0FFC2; font-size: 12px; color: #999;">
        If you did not place this order, please ignore this email.
      </div>
    </div>
  </div>
`;

// 1️⃣ CREATE ORDER + VALIDATE + COD RESTRICTIONS
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // ========== COD RESTRICTIONS ==========
    if (paymentMethod === "COD") {
      // 1. First order restriction (Allow if user has orders OR if account is older than 30 days)
      const orderCount = await Order.countDocuments({
        userId: req.user._id,
        orderStatus: { $ne: "pending_verification" }
      });

      const isOldAccount = user.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (orderCount === 0 && !isOldAccount) {
        return res.status(400).json({
          error: "COD is not available for first-time users. Please use online payment.",
          codBlocked: true,
          reason: "first_order"
        });
      }

      // 2. Cancellation-based restriction
      if (user.cancelledOrders >= 2) {
        return res.status(403).json({
          error: "COD is disabled due to multiple cancelled orders.",
          codBlocked: true,
          reason: "cancellations"
        });
      }
    }

    // 🔍 STEP 1: STOCK VALIDATION
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ error: "Product not found" });
      if (product.stock < item.qty) {
        return res.status(400).json({ error: `Only ${product.stock} items available for ${product.name}` });
      }
    }

    // 💾 STEP 2: SAVE ORDER
    const orderData = { ...req.body, userId: req.user._id };

    if (paymentMethod === "COD") {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      orderData.orderStatus = "pending_verification";
      orderData.codOTP = otp;
      orderData.codOtpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      orderData.codOtpAttempts = 0;
      orderData.orderHistory = [{ status: "pending_verification", date: Date.now() }];

      const order = new Order(orderData);
      await order.save();

      // Send OTP via email
      const customerEmail = req.body.customerDetails?.email || user.email;
      try {
        await sendEmail(customerEmail, "Verify Your COD Order - Ghoroa Bazar", codOtpTemplate(otp));
      } catch (mailErr) {
        console.error("COD OTP email failed:", mailErr);
        await Order.findByIdAndDelete(order._id);
        return res.status(500).json({ error: "Failed to send verification email." });
      }

      return res.status(201).json({
        message: "COD OTP sent to your email. Please verify to confirm order.",
        orderId: order._id,
        requiresVerification: true
      });
    }

    // ✅ Online Payment Flow
    orderData.orderHistory = [{ status: "Placed", date: Date.now() }];
    const order = new Order(orderData);
    await order.save();

    // 🔻 REDUCE STOCK + EMIT Updated Stock
    const io = req.app.get("io");
    for (const item of items) {
      const updatedProduct = await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty, purchaseCount: item.qty } }, { new: true });
      if (io && updatedProduct) {
        io.emit("stockUpdated", { productId: updatedProduct._id, stock: updatedProduct.stock });
      }
    }

    res.status(201).json({ message: "Order placed successfully", order });

    // 🔔 NOTIFY ADMIN (Persistent + Real-time)
    if (io) {
      const customerName = req.body.customerDetails?.firstName || "A customer";
      const notificationData = {
        message: `New order from ${customerName}`,
        type: "new_order",
        role: "admin",
        orderId: order._id,
      };

      // Save to database
      const notification = new Notification(notificationData);
      await notification.save();

      // Emit to admin room
      io.to("admin_room").emit("admin:notification", {
        ...notificationData,
        _id: notification._id,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
        createdAt: notification.createdAt
      });

      // Legacy event for compatibility (optional, keeping to avoid breaking UI before update)
      io.to("admin_room").emit("newOrderNotification", {
        message: `New order from ${customerName}`,
        orderId: order._id,
        userId: req.user._id.toString(),
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
        createdAt: order.createdAt
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 2️⃣ VERIFY COD OTP
router.post("/verify-cod", authMiddleware, async (req, res) => {
  try {
    const { otp, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Access denied" });
    if (order.orderStatus !== "pending_verification") return res.status(400).json({ error: "Order is not pending verification" });

    // Max attempts check
    if (order.codOtpAttempts >= 3) {
      order.orderStatus = "Cancelled";
      order.orderHistory.push({ status: "Cancelled", date: Date.now() });
      await order.save();
      return res.status(400).json({ error: "Maximum OTP attempts exceeded. Order cancelled." });
    }

    // Expiry check
    if (order.codOtpExpiry < Date.now()) return res.status(400).json({ error: "OTP expired." });

    // OTP validation
    if (order.codOTP !== otp) {
      order.codOtpAttempts += 1;
      await order.save();
      return res.status(400).json({ error: `Invalid OTP. ${3 - order.codOtpAttempts} attempts left.` });
    }

    // ✅ Success
    order.orderStatus = "Placed";
    order.codOTP = undefined;
    order.codOtpExpiry = undefined;
    order.codOtpAttempts = 0;
    order.orderHistory.push({ status: "Placed", date: Date.now() });
    await order.save();

    const io = req.app.get("io");
    for (const item of order.items) {
      const updatedProduct = await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty, purchaseCount: item.qty } }, { new: true });
      if (io && updatedProduct) {
        io.emit("stockUpdated", { productId: updatedProduct._id, stock: updatedProduct.stock });
      }
    }

    // 🔔 Notify admin about confirmation (Persistent + Real-time)
    if (io) {
      const customerName = order.customerDetails?.firstName || "A customer";
      const notificationData = {
        message: `COD order confirmed by ${customerName}`,
        type: "new_order",
        role: "admin",
        orderId: order._id,
      };

      const notification = new Notification(notificationData);
      await notification.save();

      io.to("admin_room").emit("admin:notification", {
        ...notificationData,
        _id: notification._id,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
        createdAt: notification.createdAt
      });

      // Real-time update for MyOrders page
      io.to(`user_${req.user._id}`).emit("orderStatusUpdate", order);
      // Ensure Admin Orders page refreshes
      io.to("admin_room").emit("newOrderNotification", order);
    }

    res.json({ message: "Order confirmed!", order });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// 3️⃣ RESEND COD OTP
router.post("/resend-cod-otp", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== req.user._id.toString() || order.orderStatus !== "pending_verification") {
      return res.status(404).json({ error: "Invalid order for OTP resend" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.codOTP = otp;
    order.codOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    order.codOtpAttempts = 0;
    await order.save();

    const user = await User.findById(req.user._id);
    await sendEmail(order.customerDetails?.email || user.email, "New OTP - Ghoroa Bazar", codOtpTemplate(otp));

    res.json({ message: "New OTP sent." });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

// 4️⃣ COD ELIGIBILITY
router.get("/cod-eligibility", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const orderCount = await Order.countDocuments({
      userId: req.user._id,
      orderStatus: { $ne: "pending_verification" }
    });

    const isOldAccount = user.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const eligible = (orderCount > 0 || isOldAccount) && user.cancelledOrders < 2;
    res.json({ eligible, reason: orderCount === 0 && !isOldAccount ? "first_order" : user.cancelledOrders >= 2 ? "cancellations" : null });
  } catch (err) {
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});

// 5️⃣ GET ALL ORDERS (ADMIN ONLY)
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const totalItems = await Order.countDocuments();
    const orders = await Order.find()
      .populate("userId", "email name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: orders,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 6️⃣ UPDATE ORDER STATUS (ADMIN ONLY)
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.orderHistory.push({ status: orderStatus, date: Date.now() });
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus === "Delivered") order.paymentStatus = "Paid";

    await order.save();

    // ♻️ RESTORE STOCK if Cancelled
    const io = req.app.get("io");
    if (orderStatus === "Cancelled" && order.items && order.items.length > 0) {
      for (const item of order.items) {
        const updatedProduct = await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } }, { new: true });
        if (io && updatedProduct) {
          io.emit("stockUpdated", { productId: updatedProduct._id, stock: updatedProduct.stock });
        }
      }
    }

    // 🔔 Notify User (Persistent + Real-time)
    if (io && order.userId) {
      const notificationData = {
        message: `Your order is now ${orderStatus}!`,
        type: "order_status",
        role: "user",
        targetUserId: order.userId,
        orderId: order._id
      };

      const notification = new Notification(notificationData);
      await notification.save();

      io.to(`user_${order.userId.toString()}`).emit("user:notification", {
        ...notificationData,
        _id: notification._id,
        status: orderStatus,
        createdAt: notification.createdAt
      });

      io.to(`user_${order.userId.toString()}`).emit("orderNotification", {
        message: `Your order is now ${orderStatus}!`,
        orderId: order._id,
        status: orderStatus
      });

      // Real-time update for MyOrders page
      const userRoom = `user_${order.userId.toString()}`;
      logger.info(`📢 Emitting orderStatusUpdate (status: ${orderStatus}) to room: ${userRoom}`);
      io.to(userRoom).emit("orderStatusUpdate", order);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 7️⃣ MY ORDERS
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    const totalItems = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: orders,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

// 8️⃣ GET BY ID
router.get("/:id", anyAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // Allow if it's the user who placed it OR if it's an admin
    if (req.user.role !== "admin" && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// 9️⃣ CANCEL ORDER
router.put("/cancel/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Access denied" });

    if (!["Placed", "Packed"].includes(order.orderStatus)) {
      return res.status(400).json({ error: "Order cannot be cancelled at this stage" });
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = Date.now();
    order.orderHistory.push({ status: "Cancelled", date: Date.now() });
    await order.save();

    // ♻️ RESTORE STOCK + EMIT Updated Stock
    const io = req.app.get("io");
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        // Only restore if it was actually reduced (i.e., order was Placed or Packed)
        const updatedProduct = await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } }, { new: true });
        if (io && updatedProduct) {
          io.emit("stockUpdated", { productId: updatedProduct._id, stock: updatedProduct.stock });
        }
      }
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { cancelledOrders: 1 } });

    // 🔔 Notify Admin about cancellation (Persistent + Real-time)
    if (io) {
      const customerName = order.customerDetails?.firstName || "Customer";
      const notificationData = {
        message: `Order cancelled by ${customerName}`,
        type: "order_cancelled",
        role: "admin",
        orderId: order._id
      };

      const notification = new Notification(notificationData);
      await notification.save();

      io.to("admin_room").emit("admin:notification", {
        ...notificationData,
        _id: notification._id,
        totalAmount: order.totalAmount,
        createdAt: notification.createdAt
      });

      // Real-time update for MyOrders page
      io.to(`user_${order.userId.toString()}`).emit("orderStatusUpdate", order);
      // Ensure Admin Orders page refreshes
      io.to("admin_room").emit("orderCancelled", order);
    }

    res.json({ message: "Order cancelled successfully and stock restored", order });
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed" });
  }
});

module.exports = router;
