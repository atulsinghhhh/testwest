import mongoose from "mongoose";
import { Assignment } from "./src/models/Assignment";
import { connectDb } from "./src/config/db";

async function testCreate() {
  await connectDb();
  console.log("Connected to DB");
  
  const teacherId = "6a01df1cc555678e57a7bb96"; // User's ID from logs
  const newAssignment = {
    teacherId,
    title: "Test Manual Assignment",
    subject: "Math",
    questionCount: 5,
    difficulty: "Medium",
    dueDate: new Date(),
    target: {
      type: "class",
      classIds: [],
      targetLabel: "Manual Test"
    }
  };
  
  console.log("Attempting to create...");
  const created = await Assignment.create(newAssignment);
  console.log("Created ID:", created._id);
  
  const found = await Assignment.findById(created._id);
  console.log("Found after create:", found ? "Yes" : "No");
  
  process.exit(0);
}

testCreate().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
