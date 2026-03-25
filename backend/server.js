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
// 1. Environment Check (Senior Backend Engineer requirement)
// ──────────────────────────────────────────────
console.log("ENV CHECK: MONGO_URI:", process.env.MONGO_URI ? "OK" : "MISSING");
console.log("ENV CHECK: JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "MISSING");

// ──────────────────────────────────────────────
// 2. CORS Configuration
// ──────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://ghoroa-bazar.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Normalize origin: remove trailing slash if present
    const normalizedOrigin = origin ? origin.replace(/\/$/, "") : null;
    const normalizedAllowed = ALLOWED_ORIGINS.map(url => url.replace(/\/$/, ""));

    if (!origin || normalizedAllowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn("CORS Attempt Blocked from origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
};

// ──────────────────────────────────────────────
// 3. Middlewares (Strict Order)
// ──────────────────────────────────────────────
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Regex used to avoid Express 5 PathError

// REQUEST DEBUGGING
app.use((req, res, next) => {
  console.log("API HIT:", req.method, req.url);
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
// 4. Routes
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

// ──────────────────────────────────────────────
// 5. Falling Through (404 & Errors)
// ──────────────────────────────────────────────

// FALLBACK 404 ROUTE
app.use((req, res) => {
  console.log("Route not found:", req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ──────────────────────────────────────────────
// 6. DB Connection + Start
// ──────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Attempting connection...");
  })
  .catch(err => {
    console.error("MongoDB initial error:", err);
    process.exit(1);
  });

mongoose.connection.once("open", () => {
    console.log("MongoDB Connected Successfully");
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
});
