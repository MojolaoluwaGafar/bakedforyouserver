const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const { sendEmail } = require("../utils/sendEmail");
const verifyToken = require("../utils/verifyToken");

// Generate JWT token
const generateToken = ({ userId, email, role }) =>
  jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

// Signup
exports.signup = async (req, res, next) => {
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;
  const role = req.body.role || "user";

  try {
    if (!fullName || !email || !password) {
      throw Object.assign(new Error("All fields are required"), { statusCode: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw Object.assign(new Error("Email already registered"), { statusCode: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1hr

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      isApproved: role === "user",
      verificationToken,
      verificationTokenExpires,
    });

    await user.save();

    const link = `${process.env.SERVER_URL}/api/user/verify-email/${user.email}/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: `<h3>Hello ${fullName}</h3>
             <p>Click to verify your email:</p>
             <a href="${link}">${link}</a>
             <p>This link expires in 1 hour.</p>`
    });

    res.status(201).json({ message: "Signup successful. Check your email to verify." });
  } catch (err) {
    next(err);
  }
};

// Signin
exports.signin = async (req, res, next) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  try {
    if (!email || !password) {
      throw Object.assign(new Error("Email and password are required"), { statusCode: 400 });
    }

    const user = await User.findOne({ email });
    const valid = user && await bcrypt.compare(password, user.password);
    if (!valid) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 400 });
    }

    if (!user.verified) {
      throw Object.assign(new Error("Please verify your email to login"), { statusCode: 403 });
    }

    if (user.role === "baker" && !user.isApproved) {
      throw Object.assign(new Error("Your account is pending admin approval."), { statusCode: 403 });
    }

    if (user.isDisabled) {
      throw Object.assign(new Error("Account has been disabled"), { statusCode: 403 });
    }

    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        verified: user.verified && user.isApproved,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Email Verification
exports.verifyEmail = async (req, res, next) => {
  const { email, token } = req.params;

  try {
    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw Object.assign(new Error("Invalid or expired token"), { statusCode: 400 });
    }

    user.verified = true;
    user.isApproved = user.role === "user";
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    next(err);
  }
};

// Resend Verification Link
exports.resendVerificationLink = async (req, res, next) => {
  const email = req.body.email?.toLowerCase().trim();

  try {
    const user = await User.findOne({ email });
    if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
    if (!user.email) throw Object.assign(new Error("User email not found"), { statusCode: 400 });
    if (user.verified) throw Object.assign(new Error("User already verified"), { statusCode: 400 });

    const cooldown = user.lastVerificationEmailSentAt && (Date.now() - user.lastVerificationEmailSentAt < 5 * 60 * 1000);
    if (cooldown) {
      throw Object.assign(new Error("Please wait a few minutes before requesting again."), { statusCode: 429 });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 60 * 60 * 1000;
    user.lastVerificationEmailSentAt = Date.now();
    await user.save();

    const link = `${process.env.SERVER_URL}/api/user/verify-email/${user.email}/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `<h3>Hello ${user.fullName}</h3>
             <p>Click the link below to verify your email:</p>
             <a href="${link}">${link}</a>
             <p>This link expires in 1 hour.</p>`
    });

    res.status(200).json({ success: true, message: "Verification link sent" });
  } catch (err) {
    next(err);
  }
};
