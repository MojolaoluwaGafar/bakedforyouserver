const Product = require("../models/product");

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: "Name, description, and price are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one product image is required" });
    }

    const imageUrls = req.files.map(file => file.path);

    const product = new Product({
      bakerId: req.user._id,
      productName: name.trim(),
      productDescription: description.trim(),
      productPrice: parseFloat(price),
      productImageUrls: imageUrls,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("bakerId", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.bakerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    // Update fields
    if (req.body.name) product.productName = req.body.name.trim();
    if (req.body.description) product.productDescription = req.body.description.trim();
    if (req.body.price) product.productPrice = parseFloat(req.body.price);

    // Handle new images if any
    if (req.files && req.files.length > 0) {
      product.productImageUrls = req.files.map(file => file.path);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.bakerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.remove();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};
