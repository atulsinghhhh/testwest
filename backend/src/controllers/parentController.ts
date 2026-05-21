import type { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ParentProfile } from "../models/ParentProfile";
import { Test } from "../models/Test";
import { getPagination } from "../middleware/pagination";

export async function listParents(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const [total, parents] = await Promise.all([
    ParentProfile.countDocuments({}),
    ParentProfile.find({})
      .populate("user", "firstName lastName email avatarUrl")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
  ]);
  return res.json({ data: parents, page, limit, total });
}

export async function getParent(req: Request, res: Response) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
    return res.status(400).json({ error: "Invalid parent ID format" });
  }

  const parent = await ParentProfile.findOne({
    $or: [{ _id: req.params.id }, { user: req.params.id }],
  }).populate("user", "firstName lastName email avatarUrl");

  if (!parent) return res.status(404).json({ error: "Parent not found" });
  return res.json(parent);
}

export async function createParent(req: Request, res: Response) {
  const { user } = req.body;
  const existing = await User.findOne({ email: user.email.toLowerCase() });
  if (existing) return res.status(400).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(user.password, 10);

  const newUser = await User.create({
    email: user.email.toLowerCase(),
    passwordHash,
    role: "PARENT",
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
    phone: user.phone || "",
    city: user.city || "",
  });

  const profile = await ParentProfile.create({ user: newUser._id, children: [] });
  return res.status(201).json({ user: newUser, profile });
}

export async function updateParent(req: Request, res: Response) {
  const parent = await ParentProfile.findById(req.params.id);
  if (!parent) return res.status(404).json({ error: "Parent not found" });

  const { user, children } = req.body;
  if (user) {
    await User.findByIdAndUpdate(parent.user, {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      city: user.city,
    });
  }
  if (children) {
    parent.children = children;
    await parent.save();
  }

  const updated = await ParentProfile.findById(req.params.id).populate(
    "user",
    "firstName lastName email avatarUrl",
  );
  return res.json(updated);
}

export async function deleteParent(req: Request, res: Response) {
  const parent = await ParentProfile.findById(req.params.id);
  if (!parent) return res.status(404).json({ error: "Parent not found" });
  await ParentProfile.deleteOne({ _id: parent._id });
  await User.deleteOne({ _id: parent.user });
  return res.json({ message: "Parent deleted" });
}

export async function getParentChildren(req: Request, res: Response) {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: "Invalid parent ID format" });
  }

  // Try to find by Profile ID first, then by User ID
  let parent = await ParentProfile.findById(id).populate({
    path: "children",
    populate: { path: "user", select: "firstName lastName avatarUrl studentId" },
  });

  if (!parent) {
    parent = await ParentProfile.findOne({ user: id }).populate({
      path: "children",
      populate: { path: "user", select: "firstName lastName avatarUrl studentId" },
    });
  }

  if (!parent) {
    return res.status(404).json({ error: `Parent not found for ID: ${id}` });
  }

  const children = (parent.children as any[] || []).map((c) => ({
    id: String(c._id),
    name: c.user ? `${c.user.firstName} ${c.user.lastName}`.trim() : "Student",
    studentId: c.user?.studentId || "",
    grade: c.grade,
    board: c.board,
    avatarUrl: c.avatarUrl || c.user?.avatarUrl || "",
    relation: "Child",
  }));

  return res.json(children);
}

export async function getParentDashboard(req: Request, res: Response) {
  const childId = new mongoose.Types.ObjectId(req.params.childId as string);
  const completedTests = await Test.find({ studentId: childId, status: "Completed" }).sort({
    submittedAt: -1,
  });

  const testsCompleted = completedTests.length;
  const averageScore = testsCompleted
    ? Math.round(
        completedTests.reduce((s: number, t: any) => s + (t.score || 0), 0) / testsCompleted,
      )
    : 0;

  const performanceTrend = completedTests
    .slice(0, 10)
    .reverse()
    .map((t: any, idx: number) => ({
      testIndex: idx + 1,
      label: t.submittedAt
        ? t.submittedAt.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
        : new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      score: t.score || 0,
      accuracy: t.accuracy || 0,
    }));

  const topicStats = new Map<string, { total: number; correct: number; subject: string }>();
  const subtopicStats = new Map<string, { total: number; correct: number; topic: string }>();

  completedTests.forEach((t: any) => {
    t.questions?.forEach((q: any) => {
      const isCorrect = JSON.stringify(q.givenAnswer) === JSON.stringify(q.answer);
      const topicKey = `${t.subject}|${t.topic}`;
      const ts = topicStats.get(topicKey) || { total: 0, correct: 0, subject: t.subject };
      ts.total += 1;
      if (isCorrect) ts.correct += 1;
      topicStats.set(topicKey, ts);

      if (t.subtopic) {
        const subKey = `${t.subject}|${t.topic}|${t.subtopic}`;
        const ss = subtopicStats.get(subKey) || { total: 0, correct: 0, topic: t.topic };
        ss.total += 1;
        if (isCorrect) ss.correct += 1;
        subtopicStats.set(subKey, ss);
      }
    });
  });

  const weakTopics = Array.from(topicStats.entries())
    .map(([key, v]) => ({
      name: key.split("|")[1],
      subject: v.subject,
      accuracy: Math.round((v.correct / v.total) * 100),
    }))
    .filter((t) => t.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const weakSubtopics = Array.from(subtopicStats.entries())
    .map(([key, v]) => ({
      name: key.split("|")[2],
      topic: v.topic,
      accuracy: Math.round((v.correct / v.total) * 100),
    }))
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const subjectMap = new Map<string, { total: number; count: number }>();
  completedTests.forEach((t: any) => {
    const cur = subjectMap.get(t.subject) || { total: 0, count: 0 };
    cur.total += t.score || 0;
    cur.count += 1;
    subjectMap.set(t.subject, cur);
  });
  const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, v]) => ({
    subject,
    averageScore: v.count ? Math.round(v.total / v.count) : 0,
    testsTaken: v.count,
    trend: 0,
  }));

  return res.json({
    stats: {
      testsCompleted,
      averageScore,
      weakTopicsCount: weakTopics.length,
      improvementTrend: 12, // Mocked for now
    },
    performanceTrend,
    subjectPerformance,
    weakTopics,
    weakSubtopics,
    activity: completedTests.slice(0, 8).map((t: any) => ({
      id: String(t._id),
      date: t.submittedAt ? t.submittedAt.toISOString() : t.createdAt.toISOString(),
      title: `Completed ${t.subject} test`,
      description: `${t.topic}. Scored ${t.score || 0}%`,
      subject: t.subject,
      score: t.score || 0,
    })),
    insights: [
      {
        title: "Chemistry Focus",
        text: "Spending 15 mins on Organic Chemistry today would help boost the subject average.",
        type: "attention",
      },
      {
        title: "Great Progress!",
        text: "Daily practice in Physics has improved accuracy by 22% this week.",
        type: "positive",
      },
      {
        title: "Next Milestone",
        text: "Complete 3 more Math tests to reach 'Master' level.",
        type: "motivational",
      },
      {
        title: "Study Habit",
        text: "Most consistent practice happens between 5 PM and 7 PM.",
        type: "neutral",
      },
    ],
    summary: {
      text: "Progress is steady with strong performance in Mathematics, though some reinforcement is needed in specific Science topics.",
      testsThisMonth: "8 Tests",
    },
  });
}

export async function linkChild(req: Request, res: Response) {
  const { id } = req.params;
  const { studentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id as string) || !mongoose.Types.ObjectId.isValid(studentId as string)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const parent = await ParentProfile.findOne({ $or: [{ _id: id }, { user: id }] });
  if (!parent) return res.status(404).json({ error: "Parent not found" });

  const { StudentProfile } = require("../models/StudentProfile");
  const student = await StudentProfile.findOne({ 
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(studentId) ? studentId : new mongoose.Types.ObjectId() }, 
      { user: mongoose.Types.ObjectId.isValid(studentId) ? studentId : new mongoose.Types.ObjectId() }
    ] 
  }).populate("user");

  let foundStudent = student;
  if (!foundStudent) {
    const user = await User.findOne({ studentId: studentId.toUpperCase() });
    if (user) {
      foundStudent = await StudentProfile.findOne({ user: user._id }).populate("user");
    }
  }

  if (!foundStudent) return res.status(404).json({ error: "Student not found" });

  const studentIdObj = foundStudent._id as any;
  if (parent.children.some((cId: any) => cId.toString() === studentIdObj.toString())) {
    return res.status(400).json({ error: "Student already linked to this parent" });
  }

  parent.children.push(studentIdObj);
  await parent.save();

  return res.json({ message: "Student linked successfully", studentId: studentIdObj });
}
