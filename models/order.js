const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ["pending", "in_progress", "ready", "completed", "cancelled"],
    default: "pending",
  },
  deliveryOptions: {
    type: String,
    enum: ["pickup", "delivery"],
    default: "pickup",
  },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Order", orderSchema);