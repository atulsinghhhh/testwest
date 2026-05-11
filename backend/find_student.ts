import mongoose from "mongoose";
import { connectDb } from "./src/config/db";

async function findStudent() {
  await connectDb();
  const db = mongoose.connection.db;
  if (!db) throw new Error("No db");
  
  const student = await db.collection("studentprofiles").findOne({});
  if (student) {
    console.log("Found student:", student._id);
    console.log("Class ID:", student.classId);
  } else {
    console.log("No students found.");
  }
  process.exit(0);
}

findStudent().catch(err => {
  console.error(err);
  process.exit(1);
});
