import mongoose from "mongoose";
import { Question } from "./src/models/Question";
import env from "./src/config/env";

async function check() {
  await mongoose.connect(env.mongoUri);
  const subtopics = await Question.distinct("subtopic", { topic: "Intermediate concepts" });
  console.log("Subtopics for 'Intermediate concepts':", subtopics);
  await mongoose.disconnect();
}

check();
