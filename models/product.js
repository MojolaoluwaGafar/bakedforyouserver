const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  bakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productImageUrls: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Product", productSchema);