import type { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { TeacherProfile } from "../models/TeacherProfile";
import { Test } from "../models/Test";
import { Assignment } from "../models/Assignment";
import { Question } from "../models/Question";
import { getPagination } from "../middleware/pagination";

function toTestAttempt(test: any) {
  const totalQuestions = test.questions.length;
  const durationMinutes = test.durationSeconds ? Math.round(test.durationSeconds / 60) : null;
  return {
    id: String(test._id),
    subject: test.subject,
    chapter: test.chapter,
    topic: test.topic,
    date: test.submittedAt ? test.submittedAt.toISOString() : test.createdAt.toISOString(),
    score: test.score ?? 0,
    accuracy: test.accuracy ?? 0,
    durationMinutes: durationMinutes || 0,
    questionCount: totalQuestions,
    status: test.status === "Pending" ? "In progress" : test.status,
    difficulty: test.difficulty,
  };
}

function calcAccuracyScore(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export async function listStudents(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const filter: Record<string, unknown> = {};
  if (req.query.grade) filter.grade = Number(req.query.grade);
  if (req.query.board) filter.board = req.query.board;
  if (req.query.schoolId) filter.schoolId = req.query.schoolId;
  if (req.query.classId) filter.classId = req.query.classId;

  const [total, profiles] = await Promise.all([
    StudentProfile.countDocuments(filter),
    StudentProfile.find(filter)
      .populate("user", "firstName lastName email avatarUrl bio phone city")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
  ]);

  return res.json({
    data: profiles,
    page,
    limit,
    total,
  });
}

export async function getStudent(req: Request, res: Response) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
    return res.status(400).json({ error: "Invalid student ID format" });
  }
  const profile = await StudentProfile.findById(req.params.id).populate(
    "user",
    "firstName lastName email avatarUrl bio phone city",
  );
  if (!profile) return res.status(404).json({ error: "Student not found" });
  return res.json(profile);
}

async function generateStudentId() {
  let studentId = "";
  let exists = true;
  while (exists) {
    const digits = Math.floor(10000 + Math.random() * 90000); // 5 digits
    studentId = `P${digits}`;
    const user = await User.findOne({ $or: [{ studentId }, { parentId: studentId }] });
    if (!user) exists = false;
  }
  return studentId;
}

export async function createStudent(req: Request, res: Response) {
  const { user, profile } = req.body;
  const existing = await User.findOne({ email: user.email.toLowerCase() });
  if (existing) return res.status(400).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(user.password, 10);
  const studentId = await generateStudentId();

  let schoolId = profile.schoolId;
  // If created via teacher route (/:id/students), inherit schoolId from teacher
  if (!schoolId && req.params.id && mongoose.Types.ObjectId.isValid(req.params.id as string)) {
    const teacher = await TeacherProfile.findById(req.params.id);
    if (teacher) {
      schoolId = teacher.schoolId;
    }
  }

  const newUser = await User.create({
    email: user.email.toLowerCase(),
    studentId,
    passwordHash,
    role: "STUDENT",
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
    phone: user.phone || "",
    city: user.city || "",
    schoolId: schoolId || null,
  });

  const isClassIdValid = mongoose.Types.ObjectId.isValid(profile.classId);

  const newProfile = await StudentProfile.create({
    user: newUser._id,
    grade: profile.grade,
    board: profile.board,
    avatarUrl: profile.avatarUrl || "",
    schoolId: schoolId || null,
    classId: isClassIdValid ? profile.classId : null,
    section: profile.section || (!isClassIdValid ? profile.classId : ""),
    rollNo: profile.rollNo || "",
  });

  // Automatically create tests for active assignments matching this student's class
  if (newProfile.classId) {
    try {
      const activeAssignments = await Assignment.find({
        "target.classIds": newProfile.classId,
        status: "Assigned",
        dueDate: { $gte: new Date() }
      });

      for (const assignment of activeAssignments) {
        // Check if test already exists (shouldn't for a new student, but safe)
        const existingTest = await Test.findOne({ 
          assignmentId: assignment._id, 
          studentId: newProfile._id 
        });

        if (!existingTest) {
          const query: Record<string, any> = { subject: assignment.subject };
          if (assignment.chapter) query.chapter = assignment.chapter;
          if (assignment.topic) query.topic = assignment.topic;
          if (assignment.difficulty) query.difficulty = assignment.difficulty;

          let questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: Number(assignment.questionCount) || 10 } },
          ]);

          if (questions.length === 0) {
            delete query.board;
            delete query.difficulty;
            questions = await Question.aggregate([
              { $match: query },
              { $sample: { size: Number(assignment.questionCount) || 10 } },
            ]);
          }

          if (questions.length === 0) {
            delete query.chapter;
            delete query.topic;
            delete query.grade;
            questions = await Question.aggregate([
              { $match: query },
              { $sample: { size: Number(assignment.questionCount) || 10 } },
            ]);
          }

          if (questions.length === 0) {
            questions = await Question.aggregate([
              { $sample: { size: Number(assignment.questionCount) || 10 } },
            ]);
          }

          if (questions.length > 0) {
            const testQuestions = questions.map((q: any) => ({
              originalQuestionId: q._id,
              body: q.body || "Sample Question",
              options: q.options || ["A", "B", "C", "D"],
              answer: q.answer || "A",
              explanation: q.explanation || "No explanation",
            }));

            await Test.create({
              studentId: newProfile._id,
              assignmentId: assignment._id,
              subject: assignment.subject,
              chapter: assignment.chapter,
              topic: assignment.topic,
              difficulty: assignment.difficulty,
              status: "Pending",
              questions: testQuestions,
            });
            console.log(`Auto-created test for new student ${newProfile._id} for assignment ${assignment._id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error auto-creating tests for new student:", error);
    }
  }

  return res.status(201).json({ user: newUser, profile: newProfile, studentId });
}

export async function updateStudent(req: Request, res: Response) {
  const profile = await StudentProfile.findById(req.params.id);
  if (!profile) return res.status(404).json({ error: "Student not found" });

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
  
  if (profileUpdates?.manualStrongTopics) profile.manualStrongTopics = profileUpdates.manualStrongTopics;
  if (profileUpdates?.manualWeakTopics) profile.manualWeakTopics = profileUpdates.manualWeakTopics;

  await profile.save();

  const updated = await StudentProfile.findById(req.params.id).populate(
    "user",
    "firstName lastName email avatarUrl bio phone city",
  );

  return res.json(updated);
}

export async function deleteStudent(req: Request, res: Response) {
  const profile = await StudentProfile.findById(req.params.id);
  if (!profile) return res.status(404).json({ error: "Student not found" });
  await StudentProfile.deleteOne({ _id: profile._id });
  await User.deleteOne({ _id: profile.user });
  return res.json({ message: "Student deleted" });
}

export async function listStudentTests(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const filter: Record<string, unknown> = { studentId: req.params.id };
  if (req.query.status) filter.status = req.query.status;

  const [total, tests] = await Promise.all([
    Test.countDocuments(filter),
    Test.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return res.json({
    data: tests.map(toTestAttempt),
    page,
    limit,
    total,
  });
}

export async function getStudentDashboard(req: Request, res: Response) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
    return res.status(400).json({ error: "Invalid student ID format" });
  }
  const studentId = new mongoose.Types.ObjectId(req.params.id as string);

  const completedTests = await Test.find({
    studentId,
    status: "Completed",
  }).sort({ submittedAt: -1 });

  const testsTaken = completedTests.length;
  const averageScore = testsTaken
    ? Math.round(
        completedTests.reduce((sum: number, t: any) => sum + (t.score || 0), 0) / testsTaken,
      )
    : 0;
  const accuracy = testsTaken
    ? Math.round(
        completedTests.reduce((sum: number, t: any) => sum + (t.accuracy || 0), 0) / testsTaken,
      )
    : 0;

  let totalQuestionSeconds = 0;
  let totalQuestionCount = 0;
  completedTests.forEach((t: any) => {
    t.questions.forEach((q: any) => {
      totalQuestionSeconds += q.timeSpentSeconds || 0;
      totalQuestionCount += 1;
    });
  });
  const avgTimePerQuestionSec = totalQuestionCount
    ? Math.round(totalQuestionSeconds / totalQuestionCount)
    : 0;

  const recentTests = completedTests.slice(0, 8).map(toTestAttempt);

  const scoreTrend = completedTests
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

  const topicStats = new Map<string, any>();
  const subtopicStats = new Map<string, any>();

  completedTests.forEach((t: any) => {
    t.questions.forEach((q: any) => {
      if (q.givenAnswer === null || q.givenAnswer === undefined) return;
      const isCorrect = JSON.stringify(q.givenAnswer) === JSON.stringify(q.answer);
      const topicKey = `${t.subject}|${t.chapter}|${t.topic}`;
      const topicStat = topicStats.get(topicKey) || {
        subject: t.subject,
        chapter: t.chapter,
        topic: t.topic,
        correct: 0,
        total: 0,
      };
      topicStat.total += 1;
      if (isCorrect) topicStat.correct += 1;
      topicStats.set(topicKey, topicStat);

      if (t.subtopic) {
        const subKey = `${t.subject}|${t.chapter}|${t.topic}|${t.subtopic}`;
        const subStat = subtopicStats.get(subKey) || {
          subject: t.subject,
          chapter: t.chapter,
          topic: t.topic,
          subtopic: t.subtopic,
          correct: 0,
          total: 0,
        };
        subStat.total += 1;
        if (isCorrect) subStat.correct += 1;
        subtopicStats.set(subKey, subStat);
      }
    });
  });

  const weakTopics = Array.from(topicStats.values())
    .map((t: any) => ({
      id: `${t.subject}-${t.chapter}-${t.topic}`,
      subject: t.subject,
      chapter: t.chapter,
      topic: t.topic,
      accuracy: calcAccuracyScore(t.correct, t.total),
      attempts: t.total,
    }))
    .sort((a: any, b: any) => a.accuracy - b.accuracy)
    .slice(0, 6);

  const strongTopics = Array.from(topicStats.values())
    .map((t: any) => ({
      id: `${t.subject}-${t.chapter}-${t.topic}`,
      subject: t.subject,
      chapter: t.chapter,
      topic: t.topic,
      accuracy: calcAccuracyScore(t.correct, t.total),
      attempts: t.total,
    }))
    .sort((a: any, b: any) => b.accuracy - a.accuracy)
    .slice(0, 6);

  const weakSubtopics = Array.from(subtopicStats.values())
    .map((t: any) => ({
      id: `${t.subject}-${t.chapter}-${t.topic}-${t.subtopic}`,
      subject: t.subject,
      chapter: t.chapter,
      topic: t.topic,
      subtopic: t.subtopic,
      accuracy: calcAccuracyScore(t.correct, t.total),
      attempts: t.total,
    }))
    .sort((a: any, b: any) => a.accuracy - b.accuracy)
    .slice(0, 6);

  const studentProfile = await StudentProfile.findById(req.params.id).populate(
    "user",
    "firstName lastName avatarUrl",
  );

  const activeAssignments = await Assignment.find({
    $or: [
      { "target.studentIds": studentId },
      { "target.classIds": studentProfile?.classId }
    ],
    status: "Assigned"
  }).sort({ dueDate: 1 }).limit(10);

  return res.json({
    student: {
      id: String(studentProfile?._id || req.params.id),
      name: studentProfile?.user
        ? `${(studentProfile.user as any).firstName} ${(studentProfile.user as any).lastName}`.trim()
        : "Student",
      grade: studentProfile?.grade || 0,
      board: studentProfile?.board || "",
      avatarUrl: studentProfile?.avatarUrl || (studentProfile?.user as any)?.avatarUrl || "",
      allowStudentTestCreation: studentProfile?.schoolId 
        ? (await mongoose.model("School").findById(studentProfile.schoolId))?.allowStudentTestCreation ?? true
        : true,
    },
    activeAssignments: await Promise.all(activeAssignments.map(async (a) => {
      let test = await Test.findOne({ assignmentId: a._id, studentId });
      
      if (!test) {
        const query: Record<string, any> = {};
        if (a.subject) query.subject = { $regex: `^${a.subject}$`, $options: "i" };
        if (studentProfile?.grade) query.grade = Number(studentProfile.grade);
        if (studentProfile?.board) query.board = { $regex: `^${studentProfile.board}$`, $options: "i" };
        if (a.chapter) query.chapter = { $regex: `^${a.chapter}$`, $options: "i" };
        if (a.topic) query.topic = { $regex: `^${a.topic}$`, $options: "i" };
        if (a.difficulty) query.difficulty = { $regex: `^${a.difficulty}$`, $options: "i" };

        let questions = await Question.aggregate([
          { $match: query },
          { $sample: { size: Number(a.questionCount) || 10 } },
        ]);

        if (questions.length === 0) {
          // Fallback 1: Ignore board and difficulty
          delete query.board;
          delete query.difficulty;
          questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: Number(a.questionCount) || 10 } },
          ]);
        }

        if (questions.length === 0) {
          // Fallback 2: Ignore chapter, topic and grade
          delete query.chapter;
          delete query.topic;
          delete query.grade;
          questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: Number(a.questionCount) || 10 } },
          ]);
        }

        if (questions.length === 0) {
          // Fallback 3: Just get ANY questions!
          questions = await Question.aggregate([
            { $sample: { size: Number(a.questionCount) || 10 } },
          ]);
        }

        if (questions.length > 0) {
          const testQuestions = questions.map((q: any) => ({
            originalQuestionId: q._id,
            body: q.body || "Sample Question",
            options: q.options || ["A", "B", "C", "D"],
            answer: q.answer || "A",
            explanation: q.explanation || "No explanation",
          }));

          test = await Test.create({
            studentId,
            assignmentId: a._id,
            subject: a.subject,
            chapter: a.chapter,
            topic: a.topic,
            difficulty: a.difficulty,
            status: "Pending",
            questions: testQuestions,
          });
        }
      }

      return {
        id: String(a._id),
        testId: test ? String(test._id) : null,
        title: a.title,
        subject: a.subject,
        dueDate: new Date(a.dueDate).toLocaleDateString(),
      };
    })),
    stats: {
      testsTaken,
      averageScore,
      accuracy,
      avgTimePerQuestionSec,
    },
    scoreTrend,
    subjectPerformance,
    weakTopics: studentProfile?.manualWeakTopics && studentProfile.manualWeakTopics.length > 0
      ? studentProfile.manualWeakTopics.map((t: string) => ({ id: t, subject: t, topic: t, accuracy: 0, attempts: 0 }))
      : weakTopics,
    strongTopics: studentProfile?.manualStrongTopics && studentProfile.manualStrongTopics.length > 0
      ? studentProfile.manualStrongTopics.map((t: string) => ({ id: t, subject: t, topic: t, accuracy: 100, attempts: 0 }))
      : strongTopics,
    weakSubtopics,
    recentTests,
    focusInsights: [
      {
        title: "Bite-sized Recommendation",
        text: studentProfile?.manualWeakTopics && studentProfile.manualWeakTopics.length > 0
          ? `Spend 20 mins on ${studentProfile.manualWeakTopics[0]} to boost your average.`
          : "Your Geometry score dropped by 10%. Try 5 practice questions today.",
        type: "attention",
      },
      {
        title: "Weekly Achievement",
        text: studentProfile?.manualStrongTopics && studentProfile.manualStrongTopics.length > 0
          ? `You've mastered '${studentProfile.manualStrongTopics[0]}' with flying colors!`
          : "You've mastered 'Quadratic Equations' with 95% accuracy!",
        type: "positive",
      },
      {
        title: "Study Tip",
        text: "Reviewing mistakes right after a test improves retention by 40%.",
        type: "motivational",
      },
    ],
    motivation: {
      title: "Keep the momentum going!",
      description: "You're just 3 tests away from your weekly goal.",
    },
  });
}
