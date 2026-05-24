import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  const db = mongoose.connection.db;
  if (!db) return;
  const tests = await db.collection('tests').find({}).toArray();
  console.log('Total tests:', tests.length);
  console.log('Completed tests:', tests.filter(t => t.status === 'Completed').length);
  console.log('Tests with score:', tests.filter(t => t.score !== null).length);
  process.exit(0);
});
