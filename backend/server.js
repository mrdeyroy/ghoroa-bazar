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
// 1. CORS Configuration (Function-based Origin Check)
// ──────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://ghoroa-bazar.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
};

// ──────────────────────────────────────────────
// 2. Middlewares (Strict Order)
// ──────────────────────────────────────────────
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Regex used to avoid Express 5 PathError while handling preflight

// Request Debugging
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
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

// ⚡ Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket"],
});

io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);
  socket.on("joinOrderRoom", (id) => socket.join(String(id)));
  socket.on("joinUserRoom", (id) => socket.join(`user_${id}`));
  socket.on("joinAdminRoom", () => socket.join("admin_room"));
  socket.on("disconnect", () => console.log(`🔴 Socket disconnected: ${socket.id}`));
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
  console.log("Route not found:", req.originalUrl);
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Critical Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Database + Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Allowed CORS: ${ALLOWED_ORIGINS.join(", ")}`);
    });
  })
  .catch(err => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });
