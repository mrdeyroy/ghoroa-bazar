const express = require("express");
const router = express.Router();
const Broadcast = require("../models/Broadcast");
const Notification = require("../models/Notification");
const adminMiddleware = require("../middleware/adminMiddleware");
const { body, validationResult } = require("express-validator");

// 1️⃣ CREATE BROADCAST (Admin Protected)
router.post(
  "/",
  adminMiddleware,
  [body("message").notEmpty().withMessage("Message is required").trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const broadcast = new Broadcast({
        message: req.body.message,
        createdBy: req.admin?._id || "admin"
      });
      await broadcast.save();

      // Create a persistent notification for all users
      const notification = new Notification({
        message: `📢 ${req.body.message}`,
        type: "broadcast",
        role: "user"
      });
      await notification.save();

      // Emit to ALL connected users via Socket.IO
      const io = req.app.get("io");
      if (io) {
        io.emit("broadcast:new", {
          _id: notification._id, // Use notification ID for tracking
          message: broadcast.message,
          createdAt: broadcast.createdAt,
          type: "broadcast"
        });
      }

      res.status(201).json({ message: "Broadcast sent successfully", broadcast });
    } catch (err) {
      console.error("Broadcast error:", err);
      res.status(500).json({ error: "Failed to send broadcast" });
    }
  }
);

// 2️⃣ GET ALL BROADCASTS (Admin Protected)
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch broadcasts" });
  }
});

// 3️⃣ GET RECENT BROADCASTS (Public — for users to fetch unseen on login)
router.get("/recent", async (req, res) => {
  try {
    // Return broadcasts from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const broadcasts = await Broadcast.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent broadcasts" });
  }
});

// 4️⃣ DELETE BROADCAST (Admin Protected)
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const broadcast = await Broadcast.findByIdAndDelete(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ error: "Broadcast not found" });
    }
    res.json({ message: "Broadcast deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete broadcast" });
  }
});

module.exports = router;
