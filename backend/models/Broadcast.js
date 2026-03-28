const mongoose = require("mongoose");

const broadcastSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: String,
    default: "admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

broadcastSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Broadcast", broadcastSchema);
