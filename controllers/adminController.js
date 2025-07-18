const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");

// Get all users (excluding admins)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get all bakers
exports.getAllBakers = async (req, res) => {
  try {
    const bakers = await User.find({ role: "baker" });
    res.json(bakers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bakers" });
  }
};

// Approve a baker
exports.approveBaker = async (req, res) => {
  try {
    const baker = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!baker) return res.status(404).json({ error: "Baker not found" });
    res.json({ message: "Baker approved", baker });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve baker" });
  }
};

// Disable a user or baker
exports.disableUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDisabled: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User disabled", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to disable user" });
  }
};
// Enable user or baker
exports.enableUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDisabled: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User enabled", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to enable user" });
  }
};


// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user baker");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("baker");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get system metrics
exports.getMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalBakers = await User.countDocuments({ role: "baker" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

const newUsers = await User.countDocuments({
  role: "user",
  createdAt: { $gte: oneMonthAgo }
});

    res.json({ totalUsers, totalBakers, totalProducts, totalOrders, newUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};
