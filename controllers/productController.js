const Product = require("../models/product");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one product image is required" });
    }

    const imageUrls = req.files.map(file => file.path);

    const product = new Product({
      bakerId: req.user._id,
      productName: name,
      productDescription: description,
      productPrice: price,
      productImageUrls: imageUrls,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
};



exports.getProducts = async (req, res) => {
  const products = await Product.find().populate("bakerId", "name email");
  res.json(products);
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Not found" });

  if (product.bakerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  Object.assign(product, req.body);
  await product.save();
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Not found" });

  if (product.bakerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await product.remove();
  res.json({ message: "Product deleted" });
};
