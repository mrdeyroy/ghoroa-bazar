const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
require("dotenv").config();

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin portal only." });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: "Admin not found. Access revoked." });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("Admin Middleware Error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = adminMiddleware;
