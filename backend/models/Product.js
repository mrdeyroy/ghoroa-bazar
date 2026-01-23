const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  bnName: String,
  category: String,

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

  image: {
    type: String,
    required: true
  },

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

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);
