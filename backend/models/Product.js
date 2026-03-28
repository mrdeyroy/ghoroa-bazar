const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  bnName: String,
  category: {
    type: String,
    required: true,
    enum: [
      "Honey & Natural Sweeteners",
      "Fresh Fruits",
      "Ghee & Dairy",
      "Spices & Masala",
      "Dry Fruits"
    ]
  },

  // Base price (used if no weights exist)
  price: {
    type: Number,
    required: true
  },

  // Weight / Size variants
  weights: [
    {
      label: { type: String, required: true },   // "250g", "500g"
      price: { type: Number, required: true }
    }
  ],

  // Legacy field (optional)
  weight: String,

  // Main image (url string for backward compatibility)
  image: {
    type: String,
    required: true
  },

  // Multiple images with public IDs for easy deletion from Cloudinary
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ],

  description: String,

  ingredients: {
    type: String,
    default: ""
  },

  nutrition: {
    type: String,
    default: ""
  },

  stock: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },

  featured: {
    type: Boolean,
    default: false
  },

  purchaseCount: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexing for common search queries
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ name: "text" }); // Text search for products
productSchema.index({ rating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ purchaseCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ stock: 1 });
productSchema.index({ category: 1, rating: -1, price: 1 }); // Best Value compound index

module.exports = mongoose.model("Product", productSchema);
