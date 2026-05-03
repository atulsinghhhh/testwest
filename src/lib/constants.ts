import type { Board, Difficulty, QuestionType } from "@/types";

export const ALL_BOARDS: Board[] = ["CBSE", "ICSE", "IGCSE", "IB", "State Board"];
export const ALL_GRADES: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const ALL_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const ALL_QUESTION_TYPES: QuestionType[] = ["MCQ", "MSQ", "Fill in the blanks", "Short answer"];

export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  MCQ: "Single correct option",
  MSQ: "Multiple correct options",
  "Fill in the blanks": "Type the correct word",
  "Short answer": "A few sentences of explanation",
};

export const ALL_SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Hindi", "Physics", "Chemistry", "Biology"];

export const GRADIENT_MAP: Record<string, string> = {
  Mathematics: "from-blue-500/20 to-indigo-500/20",
  Science: "from-emerald-500/20 to-teal-500/20",
  English: "from-amber-500/20 to-orange-500/20",
  "Social Studies": "from-purple-500/20 to-pink-500/20",
  Hindi: "from-rose-500/20 to-red-500/20",
  Physics: "from-cyan-500/20 to-blue-500/20",
  Chemistry: "from-yellow-500/20 to-amber-500/20",
  Biology: "from-green-500/20 to-emerald-500/20",
  Computer: "from-slate-500/20 to-gray-500/20",
  Economics: "from-sky-500/20 to-blue-500/20",
};
