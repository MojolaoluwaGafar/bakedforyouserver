const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const { sendEmail, getApprovalEmail } = require("../utils/sendEmail");

// Create a new admin user (accessible by super admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Create the admin user
    const newAdmin = new User({
      fullName,
      email,
      password,
      role: "admin",
      verified: true,
      isApproved: true,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin account created", admin: newAdmin });
  } catch (error) {
    console.error("Create Admin Error:", error.message);
    res.status(500).json({ error: "Failed to create admin" });
  }
};


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
    const bakers = await User.find({ role: "baker" }).sort({ isApproved: 1 });
    res.json(bakers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bakers" });
  }
};
// Get all pending bakers
exports.getPendingBakers = async (req, res) => {
  try {
    const pendingBakers = await User.find({ role: "baker", isApproved: false });
    res.json(pendingBakers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending bakers" });
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

    const emailContent = getApprovalEmail(baker.fullName);
    await sendEmail({
      to: baker.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    res.json({ message: "Baker approved and notified", baker });
    console.log(`Approval email sent to ${baker.email}`);
  } catch (error) {
    console.error("Failed to approve and send email:", error.message);
    res.status(500).json({ error: "Failed to approve baker" });
  }
};
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();
    res.status(200).json({ message: "User approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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
