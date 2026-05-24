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

export async function generateQuestions(options: GenerateOptions, retries = 2): Promise<any> {
  const prompt = `Act as an expert K-12 educator. Generate ${options.count} high-quality educational questions.

Constraints:
${options.board && options.board !== "N/A" ? `- Board: ${options.board}` : ""}
${options.grade ? `- Grade: ${options.grade}` : ""}
${options.subject && options.subject !== "N/A" ? `- Subject: ${options.subject}` : ""}
${options.chapter && options.chapter !== "N/A" ? `- Chapter: ${options.chapter}` : ""}
${options.topic && options.topic !== "N/A" ? `- Topic: ${options.topic}` : ""}
${options.subtopic && options.subtopic !== "N/A" ? `- Subtopic: ${options.subtopic}` : ""}
- Difficulty: ${options.difficulty}
- Allowed Types: ${options.types.join(", ")}

You MUST return a strictly valid JSON object with a single "questions" array.
Example Format:
{
  "questions": [
    {
      "type": "MCQ",
      "body": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "answer": 1,
      "explanation": "2 plus 2 equals 4.",
      "difficulty": "${options.difficulty}",
      "board": "${options.board}",
      "grade": ${options.grade},
      "subject": "${options.subject}",
      "chapter": "${options.chapter}",
      "topic": "${options.topic}",
      "subtopic": "${options.subtopic || ""}"
    }
  ]
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(content);
    
    const rawQuestions = Array.isArray(data) ? data : (data.questions || []);
    
    if (!rawQuestions.length) throw new Error("No questions generated");

    const questions = rawQuestions.map((q: any) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
    }));

    const created = await Question.insertMany(questions);
    return created;
  } catch (error: any) {
    if (retries > 0) {
      console.log(`Generation failed, retrying... (${retries} retries left)`);
      return generateQuestions(options, retries - 1);
    }
    console.error("AI Generation Error:", error);
    const errorMessage = error.response?.data?.error?.message || error.message || "Failed to generate questions using AI";
    throw new Error(errorMessage);
  }
}
