import { Router } from "express";
import { z } from "zod";
import {
  createTest,
  listTests,
  getTest,
  autosaveResponse,
  submitTest,
  generateTestSeries,
} from "../controllers/testController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  body: z.object({
    studentId: z.string().optional(),
    board: z.string().optional(),
    grade: z.number().optional(),
    subject: z.string().min(1),
    chapter: z.string().optional(),
    topic: z.string().optional(),
    subtopic: z.string().optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    questionTypes: z.array(z.string()).optional(),
    count: z.number().min(1).max(100).optional(),
  }),
});

const responseSchema = z.object({
  body: z.object({
    givenAnswer: z.any().optional(),
    timeSpentSeconds: z.number().optional(),
    flagged: z.boolean().optional(),
  }),
});

router.get("/", requireAuth, listTests);
router.post("/", requireAuth, validate(createSchema), createTest);
router.get("/:id", requireAuth, getTest);
router.patch("/:id/responses/:qid", requireAuth, validate(responseSchema), autosaveResponse);
router.post("/:id/submit", requireAuth, submitTest);
router.post("/generate-ai", requireAuth, validate(createSchema), generateTestSeries);

export default router;
