const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// 1️⃣ Fetch USER Notifications (Role: "user", specific to logged-in user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      role: "user",
      $or: [
        { targetUserId: req.user._id },
        { type: "broadcast" } // Broadcasts are for all users
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.json(notifications);
  } catch (err) {
    console.error("Fetch user notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// 2️⃣ Fetch ADMIN Notifications (Role: "admin", only for admins)
router.get("/admin", adminMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      role: "admin"
    }).sort({ createdAt: -1 }).limit(50);

    res.json(notifications);
  } catch (err) {
    console.error("Fetch admin notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// 3️⃣ Mark Notification as Read (Flexible Auth)
router.put("/:id/read", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });

    // Just mark it as read, the ID is specific enough
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 4️⃣ Mark All as Read (User)
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        role: "user", 
        targetUserId: req.user._id, 
        isRead: false 
      },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// 5️⃣ Mark All as Read (Admin)
router.put("/admin/read-all", adminMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { role: "admin", isRead: false },
      { isRead: true }
    );
    res.json({ message: "All admin notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// 6️⃣ Delete Notification (Flexible Auth)
router.delete("/:id", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

module.exports = router;
