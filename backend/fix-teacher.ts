import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/User";
import dotenv from "dotenv";

dotenv.config();

async function fixUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to MongoDB");

    const email = "atul@asha.in";
    const newPassword = "0987654321";
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const result = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { passwordHash },
      { new: true }
    );

    if (result) {
      console.log(`Successfully updated password for ${email}`);
    } else {
      console.log(`User ${email} not found`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error fixing user:", error);
    process.exit(1);
  }
}

fixUser();
