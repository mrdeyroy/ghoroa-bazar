const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date
});

// Hash password before saving
// ...
adminSchema.virtual("isLocked").get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password (Safe version for production)
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
