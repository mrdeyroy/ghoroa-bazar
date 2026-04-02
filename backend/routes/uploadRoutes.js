const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const fs = require("fs");

const router = express.Router();
const anyAuth = require("../middleware/anyAuth");
const path = require("path");

// Ensure upload directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config for security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, png, webp) are allowed"), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/", anyAuth, (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large (Max 5MB)" });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No image files provided" });
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      // Use different folder based on context if needed, for now use 'general' or 'products'
      // Security: Don't trust user-provided folder name directly
      const folder = req.body.folder === "profiles" ? "profiles" : "products";

      const result = await cloudinary.uploader.upload(file.path, {
        folder: `ghoroa_bazar/${folder}`
      });

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    });

    const results = await Promise.all(uploadPromises);
    res.json(results);
  } catch (err) {
    console.error("Upload error:", err);
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ error: "Image upload failed" });
  }
});

module.exports = router;
