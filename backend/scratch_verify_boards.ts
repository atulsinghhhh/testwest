import mongoose from "mongoose";
import { Question } from "./src/models/Question";
import env from "./src/config/env";

async function check() {
  await mongoose.connect(env.mongoUri);
  const boards = await Question.distinct("board");
  console.log("Distinct Boards:", boards);
  await mongoose.disconnect();
}

check();
