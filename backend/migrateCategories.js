require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const CATEGORY_MAPPING = {
  "Honey": "Honey & Natural Sweeteners",
  "Ghee": "Ghee & Dairy",
  "Nuts": "Dry Fruits",
  "Spices": "Spices & Masala",
  "Fruits": "Fresh Fruits",
  "Organic": "Honey & Natural Sweeteners",
  "Others": "Spices & Masala",
  // Old Full names possibly in DB
  "Honey & Natural Sweeteners": "Honey & Natural Sweeteners",
  "Fresh Fruits": "Fresh Fruits",
  "Ghee & Dairy": "Ghee & Dairy",
  "Spices & Masala": "Spices & Masala",
  "Dry Fruits": "Dry Fruits"
};

async function migrate() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);

    for (let product of products) {
      const oldCat = product.category;
      const newCat = CATEGORY_MAPPING[oldCat] || "Honey & Natural Sweeteners";
      
      if (oldCat !== newCat) {
        product.category = newCat;
        await product.save();
        console.log(`Updated "${product.name}": ${oldCat} -> ${newCat}`);
      }
    }

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
