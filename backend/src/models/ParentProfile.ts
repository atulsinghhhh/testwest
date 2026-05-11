import mongoose from "mongoose";

const parentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile" }],
  },
  { timestamps: true },
);

export const ParentProfile = mongoose.model("ParentProfile", parentProfileSchema);
