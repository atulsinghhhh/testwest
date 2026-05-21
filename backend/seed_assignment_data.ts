import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/User";
import { TeacherProfile } from "./src/models/TeacherProfile";
import { StudentProfile } from "./src/models/StudentProfile";
import { School } from "./src/models/School";
import { Class } from "./src/models/Class";
import { Question } from "./src/models/Question";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Create School
    let school = await School.findOne({ name: "Greenwood International" });
    if (!school) {
      school = await School.create({
        name: "Greenwood International",
        address: "123 Education Lane",
        city: "Bangalore",
        board: "CBSE",
      });
      console.log("School created:", school._id);
    }

    // 2. Create Class
    let classObj = await Class.findOne({ schoolId: school._id, grade: 10, section: "A" });
    if (!classObj) {
      classObj = await Class.create({
        schoolId: school._id,
        grade: 10,
        section: "A",
        room: "Room 101",
      });
      console.log("Class created:", classObj._id);
    }

    // 3. Create Teacher
    const teacherEmail = "teacher@testwest.com";
    let teacherUser = await User.findOne({ email: teacherEmail });
    const passwordHash = await bcrypt.hash("password123", 10);

    if (!teacherUser) {
      teacherUser = await User.create({
        email: teacherEmail,
        passwordHash,
        role: "TEACHER",
        firstName: "Sarah",
        lastName: "Johnson",
        schoolId: school._id,
      });
      console.log("Teacher User created:", teacherUser._id);
    }

    let teacherProfile = await TeacherProfile.findOne({ user: teacherUser._id });
    if (!teacherProfile) {
      teacherProfile = await TeacherProfile.create({
        user: teacherUser._id,
        schoolId: school._id,
        subjects: ["Mathematics", "Science"],
        classIds: [classObj._id],
        experienceYears: 8,
      });
      console.log("Teacher Profile created:", teacherProfile._id);
    }

    // 4. Create Students
    const studentData = [
      { firstName: "Alice", lastName: "Smith", email: "alice@student.com" },
      { firstName: "Bob", lastName: "Brown", email: "bob@student.com" },
      { firstName: "Charlie", lastName: "Davis", email: "charlie@student.com" },
    ];

    for (const data of studentData) {
      let studentUser = await User.findOne({ email: data.email });
      if (!studentUser) {
        studentUser = await User.create({
          email: data.email,
          passwordHash,
          role: "STUDENT",
          firstName: data.firstName,
          lastName: data.lastName,
          schoolId: school._id,
        });
        console.log(`Student User created: ${data.firstName}`);
      }

      let studentProfile = await StudentProfile.findOne({ user: studentUser._id });
      if (!studentProfile) {
        studentProfile = await StudentProfile.create({
          user: studentUser._id,
          schoolId: school._id,
          classId: classObj._id,
          grade: 10,
          section: "A",
          board: "CBSE",
          rollNo: `10A${Math.floor(Math.random() * 100)}`,
        });
        console.log(`Student Profile created: ${data.firstName}`);
      }
    }

    // 5. Create Questions
    const questions = [
      {
        board: "CBSE",
        grade: 10,
        type: "MCQ",
        subject: "Mathematics",
        chapter: "Algebra",
        topic: "Linear Equations",
        difficulty: "Easy",
        body: "What is the value of x in 2x + 5 = 15?",
        options: ["2", "5", "7", "10"],
        answer: "5",
        explanation: "2x = 15 - 5 => 2x = 10 => x = 5",
      },
      {
        board: "CBSE",
        grade: 10,
        type: "MCQ",
        subject: "Mathematics",
        chapter: "Algebra",
        topic: "Linear Equations",
        difficulty: "Easy",
        body: "Solve for y: 3y - 4 = 11",
        options: ["3", "4", "5", "6"],
        answer: "5",
        explanation: "3y = 11 + 4 => 3y = 15 => y = 5",
      },
      {
        board: "CBSE",
        grade: 10,
        type: "MCQ",
        subject: "Mathematics",
        chapter: "Algebra",
        topic: "Linear Equations",
        difficulty: "Medium",
        body: "If 5x + 2 = 3x + 12, what is x?",
        options: ["2", "5", "7", "10"],
        answer: "5",
        explanation: "5x - 3x = 12 - 2 => 2x = 10 => x = 5",
      },
      {
        board: "CBSE",
        grade: 10,
        type: "MCQ",
        subject: "Mathematics",
        chapter: "Algebra",
        topic: "Linear Equations",
        difficulty: "Hard",
        body: "Solve: 2(x + 3) - 3(x - 1) = 5",
        options: ["4", "5", "6", "7"],
        answer: "4",
        explanation: "2x + 6 - 3x + 3 = 5 => -x + 9 = 5 => -x = -4 => x = 4",
      },
      {
        board: "CBSE",
        grade: 10,
        type: "MCQ",
        subject: "Mathematics",
        chapter: "Algebra",
        topic: "Linear Equations",
        difficulty: "Easy",
        body: "What is x if x/2 = 10?",
        options: ["5", "10", "15", "20"],
        answer: "20",
        explanation: "x = 10 * 2 = 20",
      },
    ];

    for (const q of questions) {
      const existing = await Question.findOne({ body: q.body });
      if (!existing) {
        await Question.create(q);
        console.log("Question created:", q.body.substring(0, 20) + "...");
      }
    }

    console.log("Seeding completed successfully!");
    console.log("\nTeacher Login Credentials:");
    console.log(`Email: ${teacherEmail}`);
    console.log("Password: password123");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
