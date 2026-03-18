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
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
