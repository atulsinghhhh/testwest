import mongoose from "mongoose";

const customGroupSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "TeacherProfile", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile" }],
  },
  { timestamps: true },
);

export const CustomGroup = mongoose.model("CustomGroup", customGroupSchema);
