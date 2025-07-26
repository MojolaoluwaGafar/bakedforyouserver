const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    bakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productDescription: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    productImageUrls: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: "At least one image URL is required",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
