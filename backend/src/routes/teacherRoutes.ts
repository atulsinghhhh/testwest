import { Router } from "express";
import { z } from "zod";
import {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats,
  getTeacherStudents,
  getTeacherSubjectAnalytics,
  getTeacherTopicMastery,
} from "../controllers/teacherController";
import { validate } from "../middleware/validate";

const router = Router();

const createSchema = z.object({
  body: z.object({
    user: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      avatarUrl: z.string().optional(),
      bio: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
    }),
    profile: z.object({
      subjects: z.array(z.string()).optional(),
      classIds: z.array(z.string()).optional(),
      schoolId: z.string().optional(),
      experienceYears: z.number().optional(),
    }),
  }),
});

const updateSchema = z.object({
  body: z.object({
    user: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        avatarUrl: z.string().optional(),
        bio: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
      })
      .optional(),
    profile: z
      .object({
        subjects: z.array(z.string()).optional(),
        classIds: z.array(z.string()).optional(),
        schoolId: z.string().optional(),
        experienceYears: z.number().optional(),
      })
      .optional(),
  }),
});

router.get("/", listTeachers);
router.post("/", validate(createSchema), createTeacher);
router.get("/:id", getTeacher);
router.patch("/:id", validate(updateSchema), updateTeacher);
router.delete("/:id", deleteTeacher);
router.get("/:id/stats", getTeacherStats);
router.get("/:id/students", getTeacherStudents);
router.get("/:id/analytics/subjects", getTeacherSubjectAnalytics);
router.get("/:id/analytics/topics", getTeacherTopicMastery);

export default router;
