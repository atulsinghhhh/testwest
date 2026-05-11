import mongoose from "mongoose";
import { Question } from "./src/models/Question";
import env from "./src/config/env";

async function check() {
  await mongoose.connect(env.mongoUri);
  const all = await Question.find({}, { board: 1 });
  const unique = new Set(all.map(q => q.board));
  console.log("Unique boards in all documents:", Array.from(unique));
  await mongoose.disconnect();
}

check();
