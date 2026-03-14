const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    // 1️⃣ Image is first uploaded to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // 2️⃣ After successful upload, the local file is deleted using fs.unlinkSync
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // 3️⃣ Only the Cloudinary URL is returned (to be saved in the database)
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);

    // Cleanup local file even if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Image upload failed" });
  }
});

module.exports = router;
