require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const compression = require("compression");


const xss = require("./middleware/xss");
const { Server } = require("socket.io");
const { globalLimiter, authLimiter } = require("./middleware/rateLimiter");
const logger = require("./utils/logger");
const cookieParser = require("cookie-parser");

const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contact");

const app = express();
const server = http.createServer(app);

// ──────────────────────────────────────────────
// 1. CORS Configuration (Senior Engineer requirements)
// ──────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(url => url.trim());

const corsOptions = {
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// ──────────────────────────────────────────────
// 2. Middlewares (Strict Order)
// ──────────────────────────────────────────────
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Handle Preflight Globally

// Logging incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "10kb" })); 
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Security Middlewares
app.use(helmet()); 
app.use(xss); 
app.use(compression()); 

// Rate Limiting
app.use("/api/", globalLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/signup", authLimiter);
app.use("/api/users/verify-email", authLimiter);
app.use("/api/admin/login", authLimiter);

// ──────────────────────────────────────────────
// ⚡ Socket.IO
// ──────────────────────────────────────────────
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket"],
});

// Socket Handler
io.on("connection", (socket) => {
  logger.info(`🟢 Socket connected: ${socket.id}`);
  socket.on("joinOrderRoom", (id) => socket.join(String(id)));
  socket.on("joinUserRoom", (id) => socket.join(`user_${id}`));
  socket.on("joinAdminRoom", () => socket.join("admin_room"));
  socket.on("disconnect", () => logger.info(`🔴 Socket disconnected: ${socket.id}`));
});

app.set("io", io);

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Ghoroa Bazar backend running (Secure)");
});

// FALLBACK 404 ROUTE
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Database + Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 Allowed CORS: ${ALLOWED_ORIGINS.join(", ")}`);
    });
  })
  .catch(err => {
    logger.error("MongoDB error:", err);
    process.exit(1);
  });
