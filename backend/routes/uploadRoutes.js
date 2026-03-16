const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.array("images", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No image files provided" });
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      // 1️⃣ Image is first uploaded to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products"
      });

      // 2️⃣ After successful upload, the local file is deleted using fs.unlinkSync
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    });

    const results = await Promise.all(uploadPromises);

    // 3️⃣ Array of Cloudinary objects is returned
    res.json(results);
  } catch (err) {
    console.error("Upload error:", err);

    // Cleanup local files even if upload fails
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ error: "Image upload failed" });
  }
});

module.exports = router;
