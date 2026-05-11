import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
  {
    board: { type: String, required: true },
    grade: { type: Number, required: true },
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    topic: { type: String, required: true },
    subtopic: { type: String, required: true },

    type: {
      type: String,
      enum: ["MCQ", "MSQ", "Fill in the blanks", "Short answer"],
      required: true,
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },

    body: { type: String, required: true },
    options: { type: Schema.Types.Mixed, default: [] }, // Array of { id, text }
    answer: { type: Schema.Types.Mixed, required: true }, // String or Array configuration
    explanation: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Question = mongoose.model("Question", questionSchema);
