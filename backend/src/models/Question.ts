import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    board: { type: String, required: true },
    grade: { type: Number, min: 1, max: 12, required: true },
    subject: { type: String, required: true },
    chapter: { type: String, default: "" },
    topic: { type: String, default: "" },
    subtopic: { type: String, default: "" },
    type: {
      type: String,
      enum: ["MCQ", "MSQ", "Fill in the blanks", "Short answer"],
      required: true,
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    body: { type: String, required: true },
    options: { type: mongoose.Schema.Types.Mixed, default: [] },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Question = mongoose.model("Question", questionSchema);
