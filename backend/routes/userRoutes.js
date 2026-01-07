const express = require("express");
const router = express.Router();
const User = require("../models/User");

// signup
router.post("/signup", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json({ message: "Signup successful" });
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ userId: user._id, name: user.name });
});

module.exports = router;
