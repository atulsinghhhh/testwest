import { connectDb } from "./src/config/db";
import { User } from "./src/models/User";
import mongoose from "mongoose";

async function run() {
  await connectDb();
  const users = await User.find({});
  console.log(users);
  await mongoose.disconnect();
}
run();
