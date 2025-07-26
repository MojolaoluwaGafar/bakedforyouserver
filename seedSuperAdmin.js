const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../bakedforyouserver/models/user");
require("dotenv").config();

async function seedSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "only1maniac007@gmail.com";
    const existingSuper = await User.findOne({ email });
    if (existingSuper) {
      console.log("👀 Superadmin already exists.");
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash("SuperAdmin123!", 10);

    const superAdmin = new User({
      fullName: "Super Admin",
      email,
      password: hashedPassword,
      role: "superadmin", // THIS is the fix
      verified: true,
      isApproved: true,
    });

    await superAdmin.save();
    console.log("✅ Superadmin seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding superadmin:", err);
    process.exit(1);
  }
}

seedSuperAdmin();
