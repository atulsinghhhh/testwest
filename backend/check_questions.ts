import mongoose from "mongoose";
import env from "./src/config/env";
import { Question } from "./src/models/Question";
import { Assignment } from "./src/models/Assignment";

async function run() {
  await mongoose.connect(env.mongoUri);
  
  const questionCount = await Question.countDocuments();
  console.log("Total Questions:", questionCount);
  
  if (questionCount > 0) {
    const sample = await Question.findOne();
    console.log("Sample Question:", {
      subject: sample.subject,
      grade: sample.grade,
      board: sample.board,
      chapter: sample.chapter,
      topic: sample.topic,
      difficulty: sample.difficulty
    });
  }

  const assignments = await Assignment.find();
  console.log("Assignments:");
  assignments.forEach(a => console.log({
    id: a._id,
    subject: a.subject,
    chapter: a.chapter,
    topic: a.topic,
    difficulty: a.difficulty,
    questionCount: a.questionCount
  }));

  process.exit(0);
}
run();
