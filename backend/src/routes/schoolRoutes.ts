import { Router } from "express";
import { z } from "zod";
import {
  listSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getSchoolStats,
  listTeachers,
  createTeacher,
} from "../controllers/schoolController";
import { validate } from "../middleware/validate";

const router = Router();

const schoolSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    board: z.string().min(1),
    city: z.string().optional(),
    principal: z.string().optional(),
  }),
});

const schoolUpdateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    board: z.string().optional(),
    city: z.string().optional(),
    principal: z.string().optional(),
  }),
});

const classSchema = z.object({
  body: z.object({
    grade: z.number().min(1).max(12),
    section: z.string().min(1),
    teacherId: z.string().optional(),
  }),
});

const classUpdateSchema = z.object({
  body: z.object({
    grade: z.number().min(1).max(12).optional(),
    section: z.string().optional(),
    teacherId: z.string().optional(),
  }),
});

router.get("/", listSchools);
router.post("/", validate(schoolSchema), createSchool);
router.get("/:id", getSchool);
router.patch("/:id", validate(schoolUpdateSchema), updateSchool);
router.delete("/:id", deleteSchool);
router.get("/:id/stats", getSchoolStats);
router.get("/:id/teachers", listTeachers);
router.post("/:id/teachers", createTeacher);

router.get("/:id/classes", listClasses);
router.post("/:id/classes", validate(classSchema), createClass);
router.patch("/:id/classes/:classId", validate(classUpdateSchema), updateClass);
router.delete("/:id/classes/:classId", deleteClass);
router.get("/:id/classes/:classId/students", getClassStudents);

export default router;
