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
    default: "Placed"
  },

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
  }
});

module.exports = mongoose.model("Order", orderSchema);
