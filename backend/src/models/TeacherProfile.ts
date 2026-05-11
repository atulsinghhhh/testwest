import mongoose from "mongoose";

const teacherProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    subjects: [{ type: String }],
    classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    experienceYears: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const TeacherProfile = mongoose.model("TeacherProfile", teacherProfileSchema);
