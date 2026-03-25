const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // use bcryptjs for better compatibility on Render

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });


// 🔒 Account lock checker (virtual)
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});


// 🔐 Hash password before saving (FIXED SAFE VERSION)
adminSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

  } catch (err) {
    console.error("HASH ERROR:", err);
    throw err; // important for mongoose
  }
});


// 🔑 Compare password safely
adminSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    if (!this.password) return false;

    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    console.error("BCRYPT COMPARE ERROR:", err);
    return false;
  }
};


module.exports = mongoose.model("Admin", adminSchema);