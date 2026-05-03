import type { Difficulty, QuestionType } from "@/types";

export interface Question {
  id: string;
  _id: string;
  originalQuestionId?: string;
  type: QuestionType;
  body: string;
  options: string[] | any;
  answer: any;
  explanation: string;
  // Per-user fields in the context of a test
  givenAnswer?: any;
  isCorrect?: boolean | null;
  timeSpentSeconds?: number;
  flagged?: boolean;
  topic?: string;
  subtopic?: string;
}

export type AnswerValue = any;

export interface TestConfig {
  studentId: string;
  board: string;
  grade: number;
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string | null;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  count: number;
}

export interface GeneratedTest {
  _id: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  status: "Pending" | "In progress" | "Completed" | "Abandoned";
  questions: Question[];
  score?: number | null;
  accuracy?: number | null;
  durationSeconds?: number | null;
  submittedAt?: string | null;
  createdAt: string;
}

export interface SubmittedTest extends GeneratedTest {
  durationSec: number;
}

export interface GradedQuestion {
  question: Question;
  answer: AnswerValue | undefined;
  status: "correct" | "incorrect" | "partial" | "skipped";
  pointsEarned: number; // 0..1
}

export function isEmpty(a: AnswerValue): boolean {
  if (!a) return true;
  if (typeof a === "string") return a.trim() === "";
  if (a.type === "MCQ") return a.selectedIndex === null;
  if (a.type === "MSQ") return a.selectedIndices.length === 0;
  if (a.type === "Fill in the blanks" || a.type === "Short answer") return a.text.trim() === "";
  return false;
}
