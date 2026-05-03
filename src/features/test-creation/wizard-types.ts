import type { Board, Difficulty, QuestionType } from "@/types";

export interface WizardState {
  board: Board | null;
  grade: number | null;
  subject: string | null;
  chapter: string | null;
  topic: string | null;
  subtopic: string | null;
  questionTypes: QuestionType[];
  difficulty: Difficulty | null;
  count: number;
  useAI: boolean;
}

export const initialWizardState: WizardState = {
  board: null,
  grade: null,
  subject: null,
  chapter: null,
  topic: null,
  subtopic: null,
  questionTypes: [],
  difficulty: null,
  count: 10,
  useAI: false,
};

export type StepId =
  | "board"
  | "grade"
  | "subject"
  | "chapter"
  | "topic"
  | "subtopic"
  | "questionTypes"
  | "difficulty"
  | "count"
  | "review";

export interface StepDef {
  id: StepId;
  title: string;
  shortLabel: string;
  description: string;
}

export const STEPS: StepDef[] = [
  { id: "board", title: "Choose your board", shortLabel: "Board", description: "Pick the curriculum your school follows." },
  { id: "grade", title: "Select your grade", shortLabel: "Grade", description: "Tests are calibrated to grade level." },
  { id: "subject", title: "Pick a subject", shortLabel: "Subject", description: "Available subjects for your grade." },
  { id: "chapter", title: "Choose a chapter", shortLabel: "Chapter", description: "Narrow down to a specific chapter." },
  { id: "topic", title: "Pick a topic", shortLabel: "Topic", description: "Focus your test on a single topic." },
  { id: "subtopic", title: "Pick a subtopic", shortLabel: "Subtopic", description: "Optional — for highly focused practice." },
  { id: "questionTypes", title: "Question types", shortLabel: "Types", description: "Choose one or more question formats." },
  { id: "difficulty", title: "Set difficulty", shortLabel: "Difficulty", description: "How challenging should the test be?" },
  { id: "count", title: "Number of questions", shortLabel: "Count", description: "5 to 50 questions per test." },
  { id: "review", title: "Review and generate", shortLabel: "Review", description: "Confirm your selections to generate the test." },
];

export function isStepValid(step: StepId, state: WizardState): boolean {
  switch (step) {
    case "board":
      return state.board !== null;
    case "grade":
      return state.grade !== null;
    case "subject":
      return state.subject !== null;
    case "chapter":
      return state.chapter !== null;
    case "topic":
      return state.topic !== null;
    case "subtopic":
      return true; // optional
    case "questionTypes":
      return state.questionTypes.length > 0;
    case "difficulty":
      return state.difficulty !== null;
    case "count":
      return state.count >= 5 && state.count <= 50;
    case "review":
      return true;
  }
}

export function isReadyToGenerate(state: WizardState): boolean {
  return (
    state.board !== null &&
    state.grade !== null &&
    state.subject !== null &&
    state.chapter !== null &&
    state.topic !== null &&
    state.questionTypes.length > 0 &&
    state.difficulty !== null &&
    state.count >= 5 &&
    state.count <= 50
  );
}
