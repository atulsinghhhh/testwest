import mongoose from "mongoose";

const assignmentTargetSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["class", "students", "group"], required: true },
    classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile" }],
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomGroup" },
    targetLabel: { type: String, default: "" },
  },
  { _id: false },
);

const assignmentSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "TeacherProfile", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    chapter: { type: String, default: "" },
    topic: { type: String, default: "" },
    questionCount: { type: Number, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    dueDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    target: { type: assignmentTargetSchema, required: true },
    totalStudents: { type: Number, default: 0 },
    submitted: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    notStarted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Assigned", "In progress", "Completed", "Overdue"],
      default: "Assigned",
    },
  },
  { timestamps: true },
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
