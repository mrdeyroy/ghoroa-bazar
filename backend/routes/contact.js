const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/ContactMessage");

/* ===========================
   SEND MESSAGE
=========================== */
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      status: "unread"
    });

    await newMessage.save();

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

/* ===========================
   GET ALL MESSAGES
=========================== */
router.get("/", async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/* ===========================
   UNREAD COUNT
=========================== */
router.get("/unread-count", async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({ status: "unread" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
});

/* ===========================
   MARK AS READ
=========================== */
router.patch("/:id/read", async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

/* ===========================
   DELETE MESSAGE
=========================== */
router.delete("/:id", async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message" });
  }
});

module.exports = router;
