import mongoose from "mongoose";
import { Assignment } from "./src/models/Assignment";
import { connectDb } from "./src/config/db";

async function testCreate() {
  await connectDb();
  console.log("Connected to DB");
  
  const teacherId = "6a01df1cc555678e57a7bb96"; 
  const studentId = "69eb461d765a5f8cf84bad6b";
  
  const newAssignment = {
    teacherId,
    title: "Solo Student Test Assignment",
    subject: "Science",
    questionCount: 10,
    difficulty: "Easy",
    dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
    target: {
      type: "students",
      studentIds: [studentId],
      targetLabel: "Targeted Student"
    },
    status: "Assigned"
  };
  
  console.log("Attempting to create for student...");
  const created = await Assignment.create(newAssignment);
  console.log("Created ID:", created._id);
  
  process.exit(0);
}

testCreate().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
