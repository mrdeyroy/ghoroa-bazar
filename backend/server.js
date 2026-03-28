require("dotenv").config();

// Critical Env Variable Check
const requiredEnv = ["JWT_SECRET", "MONGO_URI"];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ CRITICAL ERROR: Environment variable ${key} is missing!`);
    if (process.env.NODE_ENV === "production") {
      // In production, we should know if things are missing
      logger.error(`Environment variable ${key} is missing in production!`);
    }
  }
});
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
const broadcastRoutes = require("./routes/broadcastRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://ghoroa-bazar.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      // Don't pass an error to callback, just say 'false' to allow the 
      // CORS middleware to handle the rejection properly.
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ──────────────────────────────────────────────
// Security Middlewares
// ──────────────────────────────────────────────
app.use(helmet());
app.use(xss); // Handles XSS, NoSQL Injection, and HPP for Express 5
app.use(compression());

// ──────────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────────
app.use("/api/", globalLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/signup", authLimiter);
app.use("/api/users/verify-email", authLimiter);
app.use("/api/admin/login", authLimiter);

// ──────────────────────────────────────────────
// ⚡ Socket.IO — production-ready config
// ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
    credentials: true
  },

  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket"],
});

app.set("io", io);

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  logger.info(`🟢 Socket connected: ${socket.id}`);

  socket.on("joinOrderRoom", (orderId) => {
    if (!orderId) return;
    const roomId = String(orderId);
    socket.join(roomId);
    logger.info(`📦 Socket ${socket.id} joined order room: ${roomId}`);
  });

  socket.on("joinUserRoom", (userId) => {
    if (!userId) return;
    const roomId = `user_${userId}`;
    socket.join(roomId);
    logger.info(`👤 Socket ${socket.id} joined user room: ${roomId}`);
  });

  // Instruction-specific join handler
  socket.on("join", ({ userId, role }) => {
    if (role === "admin") {
      socket.join("admin_room");
      logger.info(`🛡️ Socket ${socket.id} (admin) joined admin room via generic join`);
    } else if (userId) {
      const roomId = `user_${userId}`;
      socket.join(roomId);
      logger.info(`👤 Socket ${socket.id} (user) joined room ${roomId} via generic join`);
    }
  });

  socket.on("joinAdminRoom", () => {
    socket.join("admin_room");
    logger.info(`🛡️ Socket ${socket.id} joined admin room`);
  });

  socket.on("disconnect", (reason) => {
    logger.info(`🔴 Socket disconnected: ${socket.id} (${reason})`);
  });
});

app.set("trust proxy", 1);

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/broadcast", broadcastRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Ghoroa Bazar backend running (Secure)");
});

// ──────────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong! Our team has been notified." });
});

// ──────────────────────────────────────────────
// Database + Server Start
// ──────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 Allowed CORS origins: ${allowedOrigins.join(", ")}`);

    });
  })
  .catch(err => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });
