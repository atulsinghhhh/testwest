import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/User";
import dotenv from "dotenv";

dotenv.config();

async function fixAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users. Checking for unhashed passwords...`);

    let updatedCount = 0;

    for (const user of users) {
      // Bcrypt hashes usually start with $2a$, $2b$, or $2y$
      const isHashed = user.passwordHash.startsWith("$2");
      
      if (!isHashed) {
        console.log(`Hashing password for user: ${user.email || user.studentId}`);
        const plainPassword = user.passwordHash;
        user.passwordHash = await bcrypt.hash(plainPassword, 10);
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Finished. Updated ${updatedCount} users.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error fixing users:", error);
    process.exit(1);
  }
}

fixAllUsers();
