const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: String,
  bnName: String,
  category: String,

  price: Number,

  // ⭐ Weight / Size Selectable Options
  weights: [
    {
      label: String,   // e.g. "500g", "1kg", "250ml"
      price: Number    // optional — if different price per weight
    }
  ],

  weight: String, // (fallback old field, still usable)

  image: {
    type: String,
    required: true
  },

  description: String,

  // ⭐ Ingredients Section
  ingredients: {
    type: String,
    default: ""
  },

  // ⭐ Nutrition Facts Section
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