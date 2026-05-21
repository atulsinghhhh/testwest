import mongoose, { type Document } from "mongoose";

export const USER_ROLES = ["STUDENT", "PARENT", "TEACHER", "SCHOOL", "SOLO"] as const;

export interface IUser extends Document {
  email: string;
  studentId?: string; // 6-digit unique ID for students
  passwordHash: string;
  role: (typeof USER_ROLES)[number];
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
  schoolId?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    studentId: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
  },
  { timestamps: true },
);

userSchema.virtual("name").get(function name(this: IUser) {
  return `${this.firstName} ${this.lastName}`.trim();
});

export const User = mongoose.model<IUser>("User", userSchema);
