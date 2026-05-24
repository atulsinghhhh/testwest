import mongoose from "mongoose";
import env from "./src/config/env";
import { Test } from "./src/models/Test";
import { StudentProfile } from "./src/models/StudentProfile";

async function fixTests() {
  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB.");

  const profiles = await StudentProfile.find();
  let updated = 0;

  for (const profile of profiles) {
    // Tests are currently saved with user._id instead of profile._id
    const userStringId = String(profile.user);
    const profileStringId = String(profile._id);

    const result = await Test.updateMany(
      { studentId: userStringId },
      { $set: { studentId: profileStringId } }
    );
    updated += result.modifiedCount;
  }

  console.log(`Updated ${updated} orphaned tests to use Profile ID.`);
  process.exit(0);
}

fixTests().catch(console.error);
