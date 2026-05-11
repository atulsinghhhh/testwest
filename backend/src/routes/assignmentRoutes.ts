import { Router } from "express";
import { z } from "zod";
import {
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/teacherController";
import { validate } from "../middleware/validate";

const router = Router();

const createSchema = z.object({
  body: z.object({
    teacherId: z.string(),
    schoolId: z.string().optional(),
    title: z.string().min(1),
    subject: z.string().min(1),
    chapter: z.string().optional(),
    topic: z.string().optional(),
    questionCount: z.number().min(1),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    dueDate: z.string(),
    target: z.object({
      type: z.enum(["class", "students", "group"]),
      classIds: z.array(z.string()).optional(),
      studentIds: z.array(z.string()).optional(),
      groupId: z.string().optional(),
      targetLabel: z.string().optional(),
    }),
  }),
});

const updateSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    subject: z.string().optional(),
    chapter: z.string().optional(),
    topic: z.string().optional(),
    questionCount: z.number().optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
    dueDate: z.string().optional(),
    target: z
      .object({
        type: z.enum(["class", "students", "group"]).optional(),
        classIds: z.array(z.string()).optional(),
        studentIds: z.array(z.string()).optional(),
        groupId: z.string().optional(),
        targetLabel: z.string().optional(),
      })
      .optional(),
    totalStudents: z.number().optional(),
    submitted: z.number().optional(),
    inProgress: z.number().optional(),
    notStarted: z.number().optional(),
    averageScore: z.number().optional(),
    status: z.enum(["Assigned", "In progress", "Completed", "Overdue"]).optional(),
  }),
});

router.get("/", listAssignments);
router.post("/", validate(createSchema), createAssignment);
router.patch("/:id", validate(updateSchema), updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;
