const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../bakedforyouserver/models/user");
require("dotenv").config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ email: "only1maniac007@gmail.com" });
    if (existingAdmin) {
      console.log("Admin already exists.");
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash("AdminPass123!", 10);

    const admin = new User({
      fullName: "Admin",
      email: "only1maniac007@gmail.com",
      password: hashedPassword,
      role: "admin",
      verified: true,
      isApproved: true,
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedAdmin();
