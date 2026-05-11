import mongoose from "mongoose";
import { Question } from "./src/models/Question";
import env from "./src/config/env";

async function check() {
  await mongoose.connect(env.mongoUri);
  const cbse = await Question.countDocuments({ board: "CBSE" });
  const cbseBoard = await Question.countDocuments({ board: "CBSE Board" });
  console.log("CBSE count:", cbse);
  console.log("CBSE Board count:", cbseBoard);
  await mongoose.disconnect();
}

check();
