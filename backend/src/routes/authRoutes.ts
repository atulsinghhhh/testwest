import { Router } from "express";
import { z } from "zod";
import { register, login, me } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["STUDENT", "PARENT", "TEACHER", "SCHOOL", "SOLO"]),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    profile: z
      .object({
        grade: z.number().min(1).max(12).optional(),
        board: z.string().optional(),
        avatarUrl: z.string().optional(),
        bio: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        schoolId: z.string().optional(),
        classId: z.string().optional(),
        section: z.string().optional(),
        rollNo: z.string().optional(),
        subjects: z.array(z.string()).optional(),
        classIds: z.array(z.string()).optional(),
        experienceYears: z.number().optional(),
      })
      .optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1),
    password: z.string().min(1),
  }),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);

export default router;
