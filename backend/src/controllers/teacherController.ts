import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { TeacherProfile } from "../models/TeacherProfile";
import { StudentProfile } from "../models/StudentProfile";
import { Class } from "../models/Class";
import { Assignment } from "../models/Assignment";
import { Test } from "../models/Test";
import { getPagination } from "../middleware/pagination";

export async function listTeachers(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const [total, teachers] = await Promise.all([
    TeacherProfile.countDocuments({}),
    TeacherProfile.find({})
      .populate("user", "firstName lastName email avatarUrl")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
  ]);
  return res.json({ data: teachers, page, limit, total });
}

export async function getTeacher(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id).populate(
    "user",
    "firstName lastName email avatarUrl",
  );
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });
  return res.json(teacher);
}

export async function createTeacher(req: Request, res: Response) {
  const { user, profile } = req.body;
  const existing = await User.findOne({ email: user.email.toLowerCase() });
  if (existing) return res.status(400).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(user.password, 10);

  const newUser = await User.create({
    email: user.email.toLowerCase(),
    passwordHash,
    role: "TEACHER",
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
    phone: user.phone || "",
    city: user.city || "",
  });

  const newProfile = await TeacherProfile.create({
    user: newUser._id,
    subjects: profile.subjects || [],
    classIds: profile.classIds || [],
    schoolId: profile.schoolId || null,
    experienceYears: profile.experienceYears || 0,
  });

  return res.status(201).json({ user: newUser, profile: newProfile });
}

export async function updateTeacher(req: Request, res: Response) {
  const profile = await TeacherProfile.findById(req.params.id);
  if (!profile) return res.status(404).json({ error: "Teacher not found" });

  const { user, profile: profileUpdates } = req.body;
  if (user) {
    await User.findByIdAndUpdate(profile.user, {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      city: user.city,
    });
  }
  Object.assign(profile, profileUpdates || {});
  await profile.save();

  const updated = await TeacherProfile.findById(req.params.id).populate(
    "user",
    "firstName lastName email avatarUrl",
  );
  return res.json(updated);
}

export async function deleteTeacher(req: Request, res: Response) {
  const profile = await TeacherProfile.findById(req.params.id);
  if (!profile) return res.status(404).json({ error: "Teacher not found" });
  await TeacherProfile.deleteOne({ _id: profile._id });
  await User.deleteOne({ _id: profile.user });
  return res.json({ message: "Teacher deleted" });
}

export async function getTeacherStats(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const classes = await Class.find({ _id: { $in: teacher.classIds } });
  const students = await StudentProfile.find({ classId: { $in: teacher.classIds } });
  const studentIds = students.map((s) => s._id);
  const completedTests = await Test.find({ studentId: { $in: studentIds }, status: "Completed" });

  const averageScore = completedTests.length
    ? Math.round(
        completedTests.reduce((s: number, t: any) => s + (t.score || 0), 0) / completedTests.length,
      )
    : 0;

  const activeAssignments = await Assignment.countDocuments({
    teacherId: teacher._id,
    status: { $in: ["Assigned", "In progress"] },
  });
  const completedAssignments = await Assignment.countDocuments({
    teacherId: teacher._id,
    status: "Completed",
  });

  return res.json({
    totalStudents: students.length,
    classes: classes.length,
    activeAssignments,
    completedAssignments,
    averageScore,
  });
}

export async function getTeacherStudents(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const students = await StudentProfile.find({ classId: { $in: teacher.classIds } }).populate(
    "user",
    "firstName lastName avatarUrl",
  );

  return res.json(
    students.map((s: any) => ({
      id: String(s._id),
      name: s.user ? `${s.user.firstName} ${s.user.lastName}`.trim() : "Student",
      grade: s.grade,
      section: s.section,
      avgScore: 0,
      testsTaken: 0,
      attendance: 0,
      weakSubject: "",
      strongSubject: "",
      trend: 0,
    })),
  );
}

export async function getTeacherSubjectAnalytics(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const students = await StudentProfile.find({ classId: { $in: teacher.classIds } });
  const studentIds = students.map((s) => s._id);
  const tests = await Test.find({ studentId: { $in: studentIds }, status: "Completed" });

  const subjectMap = new Map<string, { total: number; count: number }>();
  tests.forEach((t: any) => {
    const cur = subjectMap.get(t.subject) || { total: 0, count: 0 };
    cur.total += t.score || 0;
    cur.count += 1;
    subjectMap.set(t.subject, cur);
  });

  const analytics = Array.from(subjectMap.entries()).map(([subject, v]) => ({
    subject,
    averageScore: v.count ? Math.round(v.total / v.count) : 0,
    testsTaken: v.count,
    trend: 0,
  }));

  return res.json(analytics);
}

export async function getTeacherTopicMastery(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const students = await StudentProfile.find({ classId: { $in: teacher.classIds } });
  const studentIds = students.map((s) => s._id);
  const tests = await Test.find({ studentId: { $in: studentIds }, status: "Completed" });

  const topicMap = new Map<
    string,
    { chapter: string; topic: string; correct: number; total: number }
  >();
  tests.forEach((t: any) => {
    const key = `${t.chapter}|${t.topic}`;
    const cur = topicMap.get(key) || { chapter: t.chapter, topic: t.topic, correct: 0, total: 0 };
    t.questions.forEach((q: any) => {
      if (q.givenAnswer === null || q.givenAnswer === undefined) return;
      cur.total += 1;
      if (JSON.stringify(q.givenAnswer) === JSON.stringify(q.answer)) cur.correct += 1;
    });
    topicMap.set(key, cur);
  });

  const topics = Array.from(topicMap.values()).map((t) => ({
    chapter: t.chapter,
    topic: t.topic,
    mastery: t.total ? Math.round((t.correct / t.total) * 100) : 0,
    studentsAttempted: students.length,
  }));

  return res.json(topics);
}

export async function listAssignments(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const filter: Record<string, unknown> = {};
  if (req.query.teacherId) filter.teacherId = req.query.teacherId;
  const [total, assignments] = await Promise.all([
    Assignment.countDocuments(filter),
    Assignment.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
  ]);
  return res.json({ data: assignments, page, limit, total });
}

export async function createAssignment(req: Request, res: Response) {
  console.log("Creating assignment with body:", JSON.stringify(req.body, null, 2));
  const assignment = await Assignment.create(req.body);
  console.log("Assignment created successfully:", assignment._id);
  return res.status(201).json(assignment);
}

export async function updateAssignment(req: Request, res: Response) {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!assignment) return res.status(404).json({ error: "Assignment not found" });
  return res.json(assignment);
}

export async function deleteAssignment(req: Request, res: Response) {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) return res.status(404).json({ error: "Assignment not found" });
  return res.json({ message: "Assignment deleted" });
}
