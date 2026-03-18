const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

// 1️⃣ ADD product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// 2️⃣ GET all products with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, featured, limit } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    let productsQuery = Product.find(query).sort({ createdAt: -1 });

    if (limit) {
      productsQuery = productsQuery.limit(parseInt(limit));
    }

    const products = await productsQuery;
    res.json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 3️⃣ GET single product by ID (🔥 REQUIRED for product page)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// 4️⃣ UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check for removed images to delete from Cloudinary
    if (req.body.images && product.images) {
      const currentPublicIds = req.body.images.map(img => img.public_id);
      const removedImages = product.images.filter(img => !currentPublicIds.includes(img.public_id));
      
      if (removedImages.length > 0) {
        const deletePromises = removedImages.map(img => 
          cloudinary.uploader.destroy(img.public_id)
        );
        await Promise.all(deletePromises);
      }
    }

    console.log("Updating product:", req.params.id, " - New category:", req.body.category);
    
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update all fields from body except protected ones
    Object.keys(req.body).forEach(key => {
      if (key !== "_id" && key !== "__v") {
        existingProduct[key] = req.body[key];
      }
    });

    await existingProduct.save();
    console.log("Successfully saved category:", existingProduct.category);
    res.json(existingProduct);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 5️⃣ DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(img => 
        cloudinary.uploader.destroy(img.public_id)
      );
      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// 6️⃣ SUBMIT a review
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:id/reviews", authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.userId?.toString() === req.user._id.toString() || r.name === req.user.name
      );

      if (alreadyReviewed) {
        return res.status(400).json({ error: "Product already reviewed" });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        userId: req.user._id
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
