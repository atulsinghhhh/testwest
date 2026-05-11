import mongoose from "mongoose";
import { Question } from "./src/models/Question";
import env from "./src/config/env";

async function check() {
  await mongoose.connect(env.mongoUri);
  const topics = await Question.distinct("topic");
  for (const topic of topics) {
    const subs = await Question.distinct("subtopic", { topic });
    console.log(`Topic: '${topic}', Subtopics:`, subs.filter(s => s !== ""));
  }
  await mongoose.disconnect();
}

check();
