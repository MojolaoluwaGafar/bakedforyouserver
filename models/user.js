const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "baker", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const bakerSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bakeryName: { type: String, required: true },
  bakeryAddress: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const productSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bakerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productImageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const orderSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bakerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ["pending","in_progress","ready", "completed", "cancelled"],
    default: "pending",
  },
  deliveryOptions: {
    type: String,
    enum: ["pickup", "delivery"],
    default: "pickup",
  },
  createdAt: { type: Date, default: Date.now },
});
const paymentSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  stripePaymentIntentId: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  amountPaid: { type: Number, required: true },
  currency: { type: String, required: true, default: "USD" },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("User", userSchema);
