import { Router } from "express";
import { z } from "zod";
import { getMe, updateMe } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

const updateSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatarUrl: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
  }),
});

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, validate(updateSchema), updateMe);

export default router;
