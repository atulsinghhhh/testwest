import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { School } from "../models/School";
import { User } from "../models/User";
import { Class } from "../models/Class";
import { StudentProfile } from "../models/StudentProfile";
import { TeacherProfile } from "../models/TeacherProfile";
import { Test } from "../models/Test";
import { getPagination } from "../middleware/pagination";

export async function listSchools(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const [total, schools] = await Promise.all([
    School.countDocuments({}),
    School.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }),
  ]);
  return res.json({ data: schools, page, limit, total });
}

export async function getSchool(req: Request, res: Response) {
  const school = await School.findById(req.params.id);
  if (!school) return res.status(404).json({ error: "School not found" });
  return res.json(school);
}

export async function createSchool(req: Request, res: Response) {
  const school = await School.create(req.body);
  
  // Link the creator to the school if they are a SCHOOL role
  if (req.user && req.user.role === "SCHOOL") {
    await User.findByIdAndUpdate(req.user._id, { schoolId: school._id });
  }
  
  return res.status(201).json(school);
}

export async function updateSchool(req: Request, res: Response) {
  const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!school) return res.status(404).json({ error: "School not found" });
  return res.json(school);
}

export async function deleteSchool(req: Request, res: Response) {
  const school = await School.findByIdAndDelete(req.params.id);
  if (!school) return res.status(404).json({ error: "School not found" });
  return res.json({ message: "School deleted" });
}

export async function listClasses(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const filter = { schoolId: req.params.id };
  const [total, classes] = await Promise.all([
    Class.countDocuments(filter),
    Class.find(filter).skip(skip).limit(limit).sort({ grade: 1, section: 1 }),
  ]);
  return res.json({ data: classes, page, limit, total });
}

export async function createClass(req: Request, res: Response) {
  const newClass = await Class.create({ ...req.body, schoolId: req.params.id });
  
  // Link class to teacher if assigned
  if (req.body.teacherId) {
    await TeacherProfile.findByIdAndUpdate(req.body.teacherId, {
      $addToSet: { classIds: newClass._id }
    });
  }
  
  return res.status(201).json(newClass);
}

export async function updateClass(req: Request, res: Response) {
  const oldClass = await Class.findById(req.params.classId);
  const updated = await Class.findOneAndUpdate(
    { _id: req.params.classId, schoolId: req.params.id },
    req.body,
    { new: true },
  );
  if (!updated) return res.status(404).json({ error: "Class not found" });

  // Handle teacher change
  if (req.body.teacherId && String(oldClass?.teacherId) !== String(req.body.teacherId)) {
    // Remove from old teacher
    if (oldClass?.teacherId) {
      await TeacherProfile.findByIdAndUpdate(oldClass.teacherId, {
        $pull: { classIds: updated._id }
      });
    }
    // Add to new teacher
    await TeacherProfile.findByIdAndUpdate(req.body.teacherId, {
      $addToSet: { classIds: updated._id }
    });
  }

  return res.json(updated);
}

export async function deleteClass(req: Request, res: Response) {
  const deleted = await Class.findOneAndDelete({
    _id: req.params.classId,
    schoolId: req.params.id,
  });
  if (!deleted) return res.status(404).json({ error: "Class not found" });
  return res.json({ message: "Class deleted" });
}

export async function getClassStudents(req: Request, res: Response) {
  const students = await StudentProfile.find({ classId: req.params.classId }).populate(
    "user",
    "firstName lastName avatarUrl",
  );

  const studentData = await Promise.all(students.map(async (s: any) => {
    const tests = await Test.find({ studentId: s._id, status: "Completed" });
    const avgScore = tests.length 
      ? Math.round(tests.reduce((acc, t) => acc + (t.score || 0), 0) / tests.length)
      : 0;
    
    // Simple logic for strong/weak subject
    const subjScores: Record<string, { total: number, count: number }> = {};
    tests.forEach(t => {
      if (!subjScores[t.subject]) subjScores[t.subject] = { total: 0, count: 0 };
      subjScores[t.subject].total += (t.score || 0);
      subjScores[t.subject].count += 1;
    });

    const ranked = Object.entries(subjScores)
      .map(([subject, v]) => ({ subject, avg: v.total / v.count }))
      .sort((a, b) => b.avg - a.avg);

    return {
      id: String(s._id),
      name: s.user ? `${s.user.firstName} ${s.user.lastName}`.trim() : "Student",
      rollNo: s.rollNo || String(s._id).slice(-4).toUpperCase(),
      grade: s.grade,
      section: s.section,
      avgScore,
      testsTaken: tests.length,
      attendance: 90,
      strongSubject: ranked[0]?.subject || "N/A",
      weakSubject: ranked[ranked.length - 1]?.subject || "N/A"
    };
  }));

  return res.json(studentData);
}

export async function getSchoolStats(req: Request, res: Response) {
  const schoolId = req.params.id;
  const classes = await Class.find({ schoolId });
  const students = await StudentProfile.find({ schoolId });
  const tests = await Test.find({ studentId: { $in: students.map((s) => s._id) }, status: "Completed" });

  const averageScore = tests.length
    ? Math.round(tests.reduce((s: number, t: any) => s + (t.score || 0), 0) / tests.length)
    : 0;

  const subjectMap = new Map<string, { total: number; count: number }>();
  tests.forEach((t: any) => {
    const cur = subjectMap.get(t.subject) || { total: 0, count: 0 };
    cur.total += t.score || 0;
    cur.count += 1;
    subjectMap.set(t.subject, cur);
  });

  const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, v]) => ({
    subject,
    averageScore: Math.round(v.total / v.count),
    testsTaken: v.count,
    trend: 0,
  }));

  // Dynamic Grade Performance for all grades 1-12
  const gradeMap = new Map<string, { total: number; count: number }>();
  for (let i = 1; i <= 12; i++) {
    gradeMap.set(String(i), { total: 0, count: 0 });
  }

  students.forEach((s: any) => {
    const g = String(s.grade);
    if (gradeMap.has(g)) {
      const gs = gradeMap.get(g)!;
      // Find tests for this student
      const sTests = tests.filter(t => String(t.studentId) === String(s._id));
      sTests.forEach(t => {
        gs.total += t.score || 0;
        gs.count += 1;
      });
    }
  });

  const gradePerformance = Array.from(gradeMap.entries()).map(([grade, v]) => ({
    grade,
    averageScore: v.count ? Math.round(v.total / v.count) : 0,
    testsTaken: v.count,
  })).sort((a,b) => Number(a.grade) - Number(b.grade));

  const ranked = [...subjectPerformance].sort((a, b) => b.averageScore - a.averageScore);

  return res.json({
    totalStudents: students.length,
    totalClasses: classes.length,
    totalTests: tests.length,
    averageScore,
    attendance: 92, // Still mock for now as attendance model is missing
    bestSubject: ranked[0] || { subject: "N/A", averageScore: 0, testsTaken: 0, trend: 0 },
    weakSubject: ranked[ranked.length - 1] || { subject: "N/A", averageScore: 0, testsTaken: 0, trend: 0 },
    subjectPerformance,
    gradePerformance: gradePerformance.length ? gradePerformance : 
        Array.from({ length: 12 }, (_, i) => ({ grade: String(i + 1), averageScore: 0, testsTaken: 0 })),
  });
}

export async function listTeachers(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const filter = { schoolId: req.params.id };
  const [total, teachers] = await Promise.all([
    TeacherProfile.countDocuments(filter),
    TeacherProfile.find(filter)
      .populate("user", "firstName lastName email avatarUrl")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
  ]);

  const teacherData = await Promise.all(teachers.map(async (t: any) => {
    const classIds = t.classIds || [];
    const classes = await Class.find({ _id: { $in: classIds } });
    const students = await StudentProfile.find({ classId: { $in: classIds } });
    const studentIds = students.map(s => s._id);
    const tests = await Test.find({ studentId: { $in: studentIds }, status: "Completed" });
    
    const avgScore = tests.length 
      ? Math.round(tests.reduce((acc, test) => acc + (test.score || 0), 0) / tests.length)
      : 0;

    return {
      ...t.toObject(),
      studentsCount: students.length,
      avgClassScore: avgScore,
      className: classes.map(c => `${c.grade}${c.section}`).join(", ")
    };
  }));

  return res.json({ data: teacherData, page, limit, total });
}

export async function createTeacher(req: Request, res: Response) {
  const { email, password, firstName, lastName, subjects, experience, classIds } = req.body;
  const schoolId = req.params.id;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    role: "TEACHER",
    schoolId
  });

  const teacher = await TeacherProfile.create({
    user: user._id,
    schoolId,
    subjects,
    experienceYears: experience || 0,
    classIds: classIds || []
  });

  // If classIds were provided, update those classes to set this teacher
  if (classIds && classIds.length > 0) {
    await mongoose.model("Class").updateMany(
      { _id: { $in: classIds } },
      { $set: { teacherId: teacher._id } }
    );
  }

  return res.status(201).json(teacher);
}
