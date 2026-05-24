import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import env from "./src/config/env";
import { User } from "./src/models/User";

async function run() {
  await mongoose.connect(env.mongoUri);
  
  const parents = await User.find({ role: "PARENT" });
  
  const newPassword = "Qwertyuiop";
  const newHash = await bcrypt.hash(newPassword, 10);

  let updatedCount = 0;
  for (const parent of parents) {
    parent.passwordHash = newHash;
    await parent.save();
    console.log(`Reset password for ${parent.email} to: ${newPassword}`);
    updatedCount++;
  }

  console.log(`Successfully reset passwords for ${updatedCount} parents.`);
  process.exit(0);
}

run();
