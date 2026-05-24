import mongoose from "mongoose";
import env from "./src/config/env";
import { User } from "./src/models/User";

async function run() {
  await mongoose.connect(env.mongoUri);
  
  const parents = await User.find({ role: "PARENT" });
  console.log(`Found ${parents.length} parents.`);

  let updatedCount = 0;
  for (const parent of parents) {
    if (!parent.parentId) {
      let parentId = "";
      let exists = true;
      while (exists) {
        const digits = Math.floor(10000 + Math.random() * 90000); // 5 digits
        parentId = `P${digits}`;
        const user = await User.findOne({ $or: [{ studentId: parentId }, { parentId }] });
        if (!user) exists = false;
      }
      parent.parentId = parentId;
      await parent.save();
      console.log(`Assigned ID ${parentId} to parent ${parent.email}`);
      updatedCount++;
    } else {
      console.log(`Parent ${parent.email} already has ID ${parent.parentId}`);
    }
  }

  console.log(`Successfully assigned IDs to ${updatedCount} parents.`);
  process.exit(0);
}

run();
