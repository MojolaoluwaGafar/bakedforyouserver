const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");
const { sendEmail, getApprovalEmail } = require("../utils/sendEmail");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");

// Reusable: sanitize user object
const sanitizeUser = (user) => {
  const { password, verificationToken, ...rest } = user.toObject();
  return rest;
};

// Create admin
exports.createAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    throw new CustomError("All fields are required", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) throw new CustomError("Email already in use", 409);

  const newAdmin = await User.create({
    fullName,
    email,
    password,
    role: "admin",
    verified: true,
    isApproved: true,
  });

  res.status(201).json({
    success: true,
    message: "Admin account created",
    data: sanitizeUser(newAdmin),
  });
});

// Get all non-admin users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } });
  res.json({
    success: true,
    message: "Users fetched",
    data: users.map(sanitizeUser),
  });
});

// Get all bakers
exports.getAllBakers = asyncHandler(async (req, res) => {
  const bakers = await User.find({ role: "baker" }).sort({ isApproved: 1 });
  res.json({
    success: true,
    message: bakers.length ? "Bakers fetched" : "No bakers found",
    data: bakers.map(sanitizeUser),
  });
});

// Get pending bakers
exports.getPendingBakers = asyncHandler(async (req, res) => {
  const pending = await User.find({ role: "baker", isApproved: false });
  res.json({
    success: true,
    message: "Pending bakers fetched",
    data: pending.map(sanitizeUser),
  });
});

// Approve a baker
exports.approveBaker = asyncHandler(async (req, res) => {
  const baker = await User.findById(req.params.id);
  if (!baker) throw new CustomError("Baker not found", 404);
  if (baker.isApproved) throw new CustomError("Baker already approved", 409);

  baker.isApproved = true;
  await baker.save();

  const emailContent = getApprovalEmail(baker.fullName);
  await sendEmail({
    to: baker.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  console.log(`Approval email sent to ${baker.email}`);
  res.json({
    success: true,
    message: "Baker approved and notified",
    data: sanitizeUser(baker),
  });
});

// Approve a user
// exports.approveUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.userId);
//   if (!user) throw new CustomError("User not found", 404);
//   if (user.isApproved) throw new CustomError("User already approved", 409);

//   user.isApproved = true;
//   await user.save();

//   res.json({
//     success: true,
//     message: "User approved",
//     data: sanitizeUser(user),
//   });
// });
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userToApprove = await User.findById(userId);

    if (!userToApprove) {
      return res.status(404).json({ message: "User not found" });
    }

    // Logic gate based on role of user being approved
    if (userToApprove.role === "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only superadmins can approve admins",
      });
    }

    // For approving baker or customer – admin or superadmin
    if (
      ["baker", "customer"].includes(userToApprove.role) &&
      !["admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(403).json({
        message: "Only admins or superadmins can approve bakers/customers",
      });
    }

    userToApprove.isApproved = true;
    await userToApprove.save();

    res.status(200).json({ message: "User approved successfully" });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Disable user
exports.disableUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isDisabled: true },
    { new: true }
  );
  if (!user) throw new CustomError("User not found", 404);

  res.json({
    success: true,
    message: "User disabled",
    data: sanitizeUser(user),
  });
});

// Enable user
exports.enableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new CustomError("User not found", 404);
  if (!user.isDisabled) throw new CustomError("User already enabled", 409);

  user.isDisabled = false;
  await user.save();

  res.json({
    success: true,
    message: "User enabled",
    data: sanitizeUser(user),
  });
});

// Get all orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, baker } = req.query;
  const filters = {};
  if (status) filters.status = status;
  if (baker) filters.baker = baker;

  const orders = await Order.find(filters)
    .populate("user baker")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Orders fetched",
    data: orders,
  });
});

// Get all products
exports.getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("baker")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Products fetched",
    data: products,
  });
});

// Get metrics
exports.getMetrics = asyncHandler(async (req, res) => {
  const [totalUsers, totalBakers, totalProducts, totalOrders] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "baker" }),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [newUsers, newBakers] = await Promise.all([
    User.countDocuments({ role: "user", createdAt: { $gte: oneMonthAgo } }),
    User.countDocuments({ role: "baker", createdAt: { $gte: oneMonthAgo } }),
  ]);

  res.json({
    success: true,
    message: "Metrics fetched",
    data: {
      totalUsers,
      totalBakers,
      totalProducts,
      totalOrders,
      newUsers,
      newBakers,
    },
  });
});
