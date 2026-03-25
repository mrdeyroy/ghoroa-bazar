const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const cloudinary = require("../utils/cloudinary");

const adminMiddleware = require("../middleware/adminMiddleware");
const { body, validationResult } = require("express-validator");

// 1️⃣ ADD product (Admin Protected + Validated)
router.post("/", 
  adminMiddleware,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("stock").isNumeric().withMessage("Stock must be a number")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add product" });
    }
});

// 2️⃣ GET ALL products (Public)
router.get("/", async (req, res) => {
  try {
    const { category, search, featured, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) query.category = category;
    if (featured) query.featured = (featured === "true");
    if (search) query.name = { $regex: search, $options: "i" };
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 3️⃣ GET SINGLE product (Public)
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

// Categories list
router.get("/all/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// 4️⃣ UPDATE product (Admin Protected)
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (req.body.name) product.name = req.body.name;
    if (req.body.price) product.price = req.body.price;
    if (req.body.category) product.category = req.body.category;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    if (req.body.description) product.description = req.body.description;
    if (req.body.featured !== undefined) product.featured = req.body.featured;

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

    Object.keys(req.body).forEach(key => {
      if (key !== "_id" && key !== "__v") {
        product[key] = req.body[key];
      }
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 5️⃣ DELETE product (Admin Protected)
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

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

// 7️⃣ RECOMMEND products
router.get("/recommend/:productId/:userId", async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const { cartProductIds, wishlistProductIds } = req.query;

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const recommendedIds = new Set();
    const finalRecommendations = [];

    // Helper function to add products avoiding duplicates and current product
    const addProducts = (products) => {
      for (const p of products) {
        if (recommendedIds.size >= 10) break; // Limit total recommendations for performance
        if (p._id.toString() !== productId && !recommendedIds.has(p._id.toString())) {
          recommendedIds.add(p._id.toString());
          finalRecommendations.push(p);
        }
      }
    };

    // 1️⃣ Products from SAME CATEGORY
    const sameCategory = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId }
    }).limit(6);
    addProducts(sameCategory);

    // 2️⃣ Products based on USER CART items (if provided via query params)
    if (cartProductIds) {
      const ids = cartProductIds.split(",");
      const cartProducts = await Product.find({
        _id: { $in: ids, $ne: productId }
      }).limit(4);
      addProducts(cartProducts);
    }

    // 3️⃣ Products from USER WISHLIST (if provided via query params)
    if (wishlistProductIds) {
      const ids = wishlistProductIds.split(",");
      const wishlistProducts = await Product.find({
        _id: { $in: ids, $ne: productId }
      }).limit(4);
      addProducts(wishlistProducts);
    }

    // 4️⃣ Products from USER PREVIOUS ORDERS
    if (userId && userId !== "guest") {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(3);
      const orderProductIds = orders.flatMap(order => order.items.map(item => item.productId));
      
      if (orderProductIds.length > 0) {
        const orderProducts = await Product.find({
          _id: { $in: orderProductIds, $ne: productId }
        }).limit(4);
        addProducts(orderProducts);
      }
    }

    // 5️⃣ Fallback: Random products (if we have less than 4)
    if (finalRecommendations.length < 4) {
      const fallback = await Product.find({
        _id: { $nin: Array.from(recommendedIds).concat([productId]) }
      }).limit(4);
      addProducts(fallback);
    }

    // Always return at least 4 products (sliced to ensure max if multiple sources filled up)
    res.json(finalRecommendations.slice(0, 8));
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

module.exports = router;
