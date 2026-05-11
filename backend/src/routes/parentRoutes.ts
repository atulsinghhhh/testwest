import { Router } from "express";
import { z } from "zod";
import {
  listParents,
  getParent,
  createParent,
  updateParent,
  deleteParent,
  getParentChildren,
  getParentDashboard,
  linkChild,
} from "../controllers/parentController";
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
    children: z.array(z.string()).optional(),
  }),
});

router.get("/", listParents);
router.post("/", validate(createSchema), createParent);
router.get("/:id/children", getParentChildren);
router.get("/:id/children/:childId/dashboard", getParentDashboard);
router.get("/:id", getParent);
router.patch("/:id", validate(updateSchema), updateParent);
router.post("/:id/link-student", linkChild);
router.delete("/:id", deleteParent);

export default router;
