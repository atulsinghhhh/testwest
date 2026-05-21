import mongoose from "mongoose";
import { User } from "./src/models/User";
import { TeacherProfile } from "./src/models/TeacherProfile";
import dotenv from "dotenv";

dotenv.config();

async function fixTeacherProfile() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connected to MongoDB");

    const email = "atul@asha.in";
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const profile = await TeacherProfile.findOneAndUpdate(
        { user: user._id },
        { experienceYears: 2 },
        { new: true }
      );
      if (profile) {
        console.log(`Successfully updated experience to 2 years for ${email}`);
      } else {
        console.log(`Teacher profile for ${email} not found`);
      }
    } else {
      console.log(`User ${email} not found`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error fixing teacher profile:", error);
    process.exit(1);
  }
}

fixTeacherProfile();
