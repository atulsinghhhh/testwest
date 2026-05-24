import mongoose from "mongoose";
import env from "./src/config/env";
import { User } from "./src/models/User";

async function run() {
  await mongoose.connect(env.mongoUri);
  const users = await User.find({
    $or: [{ email: "p83107" }, { studentId: "P83107" }],
  });
  console.log("Users:", users);
  process.exit(0);
}
run();
