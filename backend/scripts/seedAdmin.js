require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
}

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        const email = "admin@ghoroabazar.com"; // Change as needed
        const password = "adminpassword123"; // Change after first login

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists. Updating password...");
            existingAdmin.password = password; 
            await existingAdmin.save(); // Model's pre-save hook handles hashing
        } else {
            const newAdmin = new Admin({ email, password });
            await newAdmin.save(); // Model's pre-save hook handles hashing
            console.log("✅ Admin created successfully!");
        }

        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Please delete this script after use or never commit it with credentials.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
};

seedAdmin();
