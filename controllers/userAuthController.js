const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

// Generate JWT token
const generateToken = ({ userId, email, role }) => {
  return jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Signup
exports.signup = async (req, res) => {
  const { fullName, email, password, role = "user" } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour

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

    const verificationLink = `${process.env.SERVER_URL}/api/user/verify-email/${user.email}/${verificationToken}`;

    await sendEmail({
  to: email,
  subject: "Verify Your Email",
  html: `<h3>Hello ${fullName}</h3>
         <p>Click the link below to verify your email:</p>
         <a href="${verificationLink}">${verificationLink}</a>
         <p>This link expires in 1 hour.</p>`
});
    res.status(201).json({
      message: "Signup successful. Check your email to verify.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// Signin
exports.signin = async (req, res) => {
  console.log("User login attempt:", req.body);
  console.log("HIT /SIGNIN ENDPOINT");
  
  
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });
    console.log("User on login:", user);

    if (!user.verified) {
      return res
        .status(403)
        .json({ success : false, message: "Please verify your email to login" });
    }

    if (user.role === "baker" && !user.isApproved) {
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval" });
    }
    if (user.isDisabled) {
  return res.status(403).json({ message: "Account has been disabled" });
}


    const token = generateToken({ userId: user._id, email, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email,
        role: user.role,
        verified: user.verified && user.isApproved,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Email Verification
exports.verifyEmail = async (req, res) => {
  const { token, email } = req.params;

  try {
    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }
  //     if (user.verificationTokenExpires < Date.now()) {
  //   return res.status(400).json({ message: 'Verification token expired' });
  // }

    await User.findByIdAndUpdate(user._id, {
  verified: true,
  isApproved: user.role === "user",
  verificationToken: undefined,
  verificationTokenExpires: undefined,
});
 await user.save();
    console.log(`Email verified for user: ${user.email}`);

//     const updatedUser = await User.findById(user._id);
// console.log("User after verification update:", updatedUser);

    // Redirect or respond
    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
    // Or Respond with a success message
    // res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Email verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Email Verification failed", error: error.message });
  }
};
// Resend Verification Link
exports.resendVerificationLink = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.email) {
  console.error("No user email found");
  return res.status(400).json({ success: false, message: "User email not found." });
}


    if (user.verified) {
      return res.status(400).json({ success: false, message: "User already verified" });
    }
    if (user.lastVerificationEmailSentAt && Date.now() - user.lastVerificationEmailSentAt < 5 * 60 * 1000) {
  return res.status(429).json({ message: "Please wait a few minutes before requesting again." });
}

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${user.email}/${verificationToken}`;
console.log("Sending email to:", user.email); // add this before sendEmail()

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `<h3>Hello ${user.fullName}</h3>
             <p>Click the link below to verify your email:</p>
             <a href="${verificationLink}">${verificationLink}</a>
             <p>This link expires in 1 hour.</p>`
    } );

    res.status(200).json({ success: true, message: "Verification link sent" });
  } catch (error) {
    console.error("Full error:", error);
    res.status(500).json({ success: false, message: "Server error. Try again later." });
  }
};

