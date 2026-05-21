import mongoose from "mongoose";
import { User } from "./src/models/User";
import dotenv from "dotenv";

dotenv.config();

async function checkStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    const studentId = "P34784";
    const user = await User.findOne({ studentId: studentId.toUpperCase() });
    
    if (user) {
      console.log(`Found student ${studentId}:`, JSON.stringify(user, null, 2));
    } else {
      console.log(`Student ${studentId} not found`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkStudent();
