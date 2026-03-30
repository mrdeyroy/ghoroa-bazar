const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
require("dotenv").config();

const anyAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if Admin
    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id);
      if (admin) {
        req.user = admin.toObject();
        req.user.role = "admin"; // Polyfill role if not in model
        return next();
      }
    }

    // Check if User
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user.toObject();
      req.user.role = decoded.role || "user";
      next();
    } else {
      res.status(404).json({ error: "Auth identity not found" });
    }

  } catch (err) {
    console.error("AnyAuth Middleware Error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = anyAuth;
