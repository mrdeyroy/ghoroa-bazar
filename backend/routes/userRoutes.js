const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/User");
const { sendEmail } = require("../utils/mail");
const { otpTemplate } = require("../utils/templates");
const { registerLimiter } = require("../middleware/rateLimiter");
const captchaVerify = require("../middleware/captchaVerify");
const emailValidator = require("../middleware/emailValidator");
require("dotenv").config();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1️⃣ Signup API
router.post("/signup", registerLimiter, captchaVerify, emailValidator, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    
    // Create new hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ error: "Email already registered and verified. Please sign in." });
      }
      
      // Update the existing unverified user with new name, password and OTP
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.verificationOTP = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      // Create a new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        verificationOTP: otp,
        otpExpires,
        isVerified: false
      });
      await user.save();
    }

    const emailHtml = otpTemplate.replace("{{OTP}}", otp);
    try {
      await sendEmail(email, "Verify your email - Ghoroa Bazar", emailHtml);
    } catch (mailErr) {
      console.error("Mail sending failed:", mailErr);
      throw new Error(`Email failed: ${mailErr.message || "Unknown error"}`);
    }

    res.status(201).json({ message: "Verification OTP sent to your email" });
  } catch (err) {
    console.error("Signup error details:", err);
    if (err.message.startsWith("Email failed")) {
      return res.status(500).json({ error: `Verification email could not be sent. Please check your email configuration.` });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

// 2️⃣ Verify Email API
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    if (user.verificationOTP !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify Email error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3️⃣ Resend OTP API
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.verificationOTP = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const emailHtml = otpTemplate.replace("{{OTP}}", otp);
    await sendEmail(email, "New Verification Code - Ghoroa Bazar", emailHtml);

    res.json({ message: "New OTP sent" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4️⃣ Login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email first" });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ error: "Account locked due to multiple failed attempts. Try again later." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }
      await user.save();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Reset login attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only send over HTTPS in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4.1️⃣ Refresh Token API
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ error: "Invalid refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (decoded.id !== user._id.toString()) return res.status(403).json({ error: "Token mismatch" });

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

// 5️⃣ Forgot Password API
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset your password - Ghoroa Bazar",
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background:#006837; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      </div>`
    );

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot Password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 6️⃣ Reset Password API
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const authMiddleware = require("../middleware/authMiddleware");

// 7️⃣ Get user profile API
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 8️⃣ Update profile API
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ message: "Profile updated", user: { name: user.name, phone: user.phone, avatar: user.avatar } });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 9️⃣ Add address API
router.post("/address", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔟 Update address API
router.put("/address/:addressId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);
    
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    Object.assign(address, req.body);
    await user.save();
    res.json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 1️⃣1️⃣ Delete address API
router.delete("/address/:addressId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.pull({ _id: req.params.addressId });
    await user.save();
    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
