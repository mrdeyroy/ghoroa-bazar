const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  avatar: String,
  addresses: [
    {
      firstName: String,
      lastName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      isDefault: { type: Boolean, default: false }
    }
  ],
  isVerified: { type: Boolean, default: false },
  verificationOTP: String,
  otpExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshToken: String,
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  cancelledOrders: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.virtual("isLocked").get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model("User", userSchema);
