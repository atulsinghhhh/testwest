import { Router } from "express";
import { z } from "zod";
import {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController";
import { validate } from "../middleware/validate";

const router = Router();

const createSchema = z.object({
  body: z.object({
    board: z.string().min(1),
    grade: z.number().min(1).max(12),
    subject: z.string().min(1),
    chapter: z.string().min(1),
    topic: z.string().min(1),
    subtopic: z.string().min(1),
    type: z.enum(["MCQ", "MSQ", "Fill in the blanks", "Short answer"]),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    body: z.string().min(1),
    options: z.any().optional(),
    answer: z.any(),
    explanation: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    board: z.string().optional(),
    grade: z.number().min(1).max(12).optional(),
    subject: z.string().optional(),
    chapter: z.string().optional(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
    type: z.enum(["MCQ", "MSQ", "Fill in the blanks", "Short answer"]).optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
    body: z.string().optional(),
    options: z.any().optional(),
    answer: z.any().optional(),
    explanation: z.string().optional(),
  }),
});

router.get("/", listQuestions);
router.post("/", validate(createSchema), createQuestion);
router.get("/:id", getQuestion);
router.patch("/:id", validate(updateSchema), updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
