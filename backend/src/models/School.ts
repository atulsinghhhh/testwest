import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    board: { type: String, required: true },
    city: { type: String, default: "" },
    principal: { type: String, default: "" },
  },
  { timestamps: true },
);

export const School = mongoose.model("School", schoolSchema);
