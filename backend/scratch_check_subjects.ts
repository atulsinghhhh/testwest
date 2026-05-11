import mongoose from "mongoose";
import { Question } from "./src/models/Question";
import env from "./src/config/env";

async function check() {
  await mongoose.connect(env.mongoUri);
  const subjects = await Question.distinct("subject", { grade: 10 });
  console.log("Subjects for Grade 10:", subjects);
  await mongoose.disconnect();
}

check();
