require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contact");

const app = express();
const server = http.createServer(app);

// ──────────────────────────────────────────────
// CORS — production-safe: explicit origin, no "*"
// ──────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(url => url.trim());

const corsOptions = {
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ──────────────────────────────────────────────
// ⚡ Socket.IO — production-ready config
// ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket"],
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // ── Join order-specific room (with duplicate guard) ──
  socket.on("joinOrderRoom", (orderId) => {
    if (!orderId) return;
    const roomId = String(orderId);

    if (socket.rooms.has(roomId)) {
      // Already in this room — skip
      return;
    }

    socket.join(roomId);
    console.log(`📦 Socket ${socket.id} joined order room: ${roomId}`);
  });

  // ── Join user-specific room (with duplicate guard) ──
  socket.on("joinUserRoom", (userId) => {
    if (!userId) return;
    const roomId = `user_${userId}`;

    if (socket.rooms.has(roomId)) {
      return;
    }

    socket.join(roomId);
    console.log(`👤 Socket ${socket.id} joined user room: ${roomId}`);
  });

  // ── Join admin room (shared room for all admins) ──
  socket.on("joinAdminRoom", () => {
    const roomId = "admin_room";

    if (socket.rooms.has(roomId)) {
      return;
    }

    socket.join(roomId);
    console.log(`🛡️ Socket ${socket.id} joined admin room`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔴 Socket disconnected: ${socket.id} (${reason})`);
  });
});

// Make io accessible to routes
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

// Health check
app.get("/", (req, res) => {
  res.send("Ghoroa Bazar backend running");
});

// ──────────────────────────────────────────────
// Database + Server Start
// ──────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Allowed CORS origins: ${ALLOWED_ORIGINS.join(", ")}`);
    });
  })
  .catch(err => console.log(err));
