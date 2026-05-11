import groq from "../config/ai";
import { Question } from "../models/Question";

interface GenerateOptions {
  board: string;
  grade: number;
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
  types: string[];
}

export async function generateQuestions(options: GenerateOptions) {
  const prompt = `Act as an expert K-12 educator. Generate ${options.count} high-quality educational questions for:
Board: ${options.board}
Grade: ${options.grade}
Subject: ${options.subject}
Chapter: ${options.chapter}
Topic: ${options.topic}
${options.subtopic ? `Subtopic: ${options.subtopic}` : ""}
Difficulty: ${options.difficulty}
Allowed Types: ${options.types.join(", ")}

IMPORTANT: You MUST return a JSON object with a "questions" key containing an array.
Each question MUST have:
1. "type": One of [MCQ, MSQ, Fill in the blanks, Short answer]
2. "body": The full question text.
3. "options": FOR MCQ/MSQ, this MUST be an array of exactly 4 strings. For others, it can be an empty array [].
4. "answer": For MCQ, the index (0, 1, 2, or 3). For MSQ, an array of indices. For others, the correct string.
5. "explanation": A helpful explanation of the correct answer.
6. "difficulty", "board", "grade", "subject", "chapter", "topic", "subtopic": Use the values provided above.

JSON format example:
{
  "questions": [
    {
      "type": "MCQ",
      "body": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "answer": 1,
      "explanation": "2 plus 2 equals 4.",
      ...rest of fields
    }
  ]
}

Return ONLY the JSON object. No extra text.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "[]";
    const data = JSON.parse(content);
    
    // The response might be wrapped in a key or just the array
    const rawQuestions = Array.isArray(data) ? data : (data.questions || []);
    
    // Ensure each question has the required structure
    const questions = rawQuestions.map((q: any) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
    }));

    // Save to DB and return
    const created = await Question.insertMany(questions);
    return created;
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    const errorMessage = error.response?.data?.error?.message || error.message || "Failed to generate questions using AI";
    throw new Error(errorMessage);
  }
}
