import mongoose from 'mongoose';
import { Question } from './src/models/Question';
import env from './src/config/env';

async function listMetadata() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to DB');

  const subjects = await Question.distinct('subject');
  console.log('Available Subjects:', subjects);

  for (const subject of subjects.slice(0, 3)) {
    const chapters = await Question.distinct('chapter', { subject });
    console.log(`Chapters for ${subject}:`, chapters);
    
    if (chapters.length > 0) {
      const topics = await Question.distinct('topic', { subject, chapter: chapters[0] });
      console.log(`Topics for ${subject} -> ${chapters[0]}:`, topics);
    }
  }

  await mongoose.disconnect();
}

listMetadata().catch(console.error);
