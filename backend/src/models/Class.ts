import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    grade: { type: Number, min: 1, max: 12, required: true },
    section: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "TeacherProfile", default: null },
  },
  { timestamps: true },
);

classSchema.index({ schoolId: 1, grade: 1, section: 1 }, { unique: true });

export const Class = mongoose.model("Class", classSchema);
