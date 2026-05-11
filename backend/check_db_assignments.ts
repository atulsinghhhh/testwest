import mongoose from "mongoose";
import { Assignment } from "./src/models/Assignment";
import { connectDb } from "./src/config/db";

async function check() {
  await connectDb();
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  
  const today = await Assignment.find({ createdAt: { $gte: startOfToday } });
  console.log("Assignments created today:", today.length);
  today.forEach((a, i) => {
    console.log(`[${i}] ID: ${a._id}, teacherId: ${a.teacherId}, title: ${a.title}`);
  });
  process.exit(0);
}

check();
