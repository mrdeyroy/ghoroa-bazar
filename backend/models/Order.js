const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  customerDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number,
      image: String,
      weight: String
    }
  ],

  totalAmount: Number,
  paymentMethod: String,

  paymentStatus: {
    type: String,
    default: "Pending"
  },

  transactionId: String,

  orderStatus: {
    type: String,
    enum: ["pending_verification", "Placed", "Packed", "Shipped", "Delivered", "Cancelled"],
    default: "Placed"
  },

  // COD OTP Verification
  codOTP: String,
  codOtpExpiry: Date,
  codOtpAttempts: { type: Number, default: 0 },

  shippingMethod: String,

  orderHistory: [
    {
      status: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: Date
});

// Indexes for performance
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
