import mongoose from "mongoose";
import env from "./src/config/env";
import { User } from "./src/models/User";

async function run() {
  await mongoose.connect(env.mongoUri);
  
  const allMatches = await User.find({
    $or: [
      { email: /p83107/i },
      { studentId: /p83107/i }
    ]
  });

  console.log("Found users matching p83107:");
  console.log(allMatches);

  const parentMatch = await User.find({ role: "PARENT" });
  console.log("All Parent users:", parentMatch.map(u => ({ email: u.email, id: u.id })));

  process.exit(0);
}
run();
