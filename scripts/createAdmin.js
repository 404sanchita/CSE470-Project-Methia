import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || "admin@methia.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Admin User";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`✅ Updated existing user to admin: ${adminEmail}`);
    } else {
      // Create new admin user
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin"
      });
      console.log(`✅ Created admin user: ${adminEmail}`);
    }

    console.log("\n📋 Admin Login Credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n✅ You can now log in as admin and access the Admin Chat interface!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
