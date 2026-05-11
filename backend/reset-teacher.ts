import mongoose from "mongoose";
import { User } from "./src/models/User";
import { TeacherProfile } from "./src/models/TeacherProfile";
import { Assignment } from "./src/models/Assignment";
import { Class } from "./src/models/Class";
import { School } from "./src/models/School";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  
  console.log("Cleaning up previous data...");
  await Assignment.deleteMany({});
  await Class.deleteMany({});
  await TeacherProfile.deleteMany({});
  await School.deleteMany({});
  const teachers = await User.find({ role: "TEACHER" });
  for (const t of teachers) {
    await User.deleteOne({ _id: t._id });
  }

  // 1. Create a School
  const school = await School.create({
    name: "Westfield International",
    board: "CBSE",
    city: "Mumbai",
  });
  console.log("School Created:", school.name);

  // 2. Create Classes
  const class6A = await Class.create({ schoolId: school._id, grade: 6, section: "A" });
  const class6B = await Class.create({ schoolId: school._id, grade: 6, section: "B" });
  console.log("Classes Created: 6-A, 6-B");

  // 3. Create a Teacher
  const hash = await bcrypt.hash("password123", 10);
  const user = await User.create({
    email: "teacher@testwest.com",
    passwordHash: hash,
    role: "TEACHER",
    firstName: "Atul",
    lastName: "Teacher",
  });

  const profile = await TeacherProfile.create({
    user: user._id,
    subjects: ["Mathematics", "Science"],
    classIds: [class6A._id, class6B._id],
    schoolId: school._id,
    experienceYears: 10,
  });

  // Update classes with teacherId
  class6A.teacherId = profile._id;
  class6B.teacherId = profile._id;
  await class6A.save();
  await class6B.save();

  console.log("Teacher Account Created Successfully!");
  console.log("Login: teacher@testwest.com / password123");
  console.log("Teacher Profile ID:", profile._id);

  process.exit(0);
}

run();
