const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ["order", "broadcast", "stock", "new_order", "order_cancelled", "order_status"]
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user"]
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'user' && this.type !== 'broadcast'; }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ role: 1, targetUserId: 1, createdAt: -1 });
notificationSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
