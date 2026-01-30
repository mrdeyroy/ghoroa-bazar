const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  customerDetails: {
    firstName: String,
    lastName: String,
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
      qty: Number
    }
  ],

  totalAmount: Number,
  paymentMethod: String,

  paymentStatus: {
    type: String,
    default: "Pending"
  },

  orderStatus: {
    type: String,
    default: "Placed"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
