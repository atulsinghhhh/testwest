import mongoose from "mongoose";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { TeacherProfile } from "../models/TeacherProfile";
import { StudentProfile } from "../models/StudentProfile";
import { Class } from "../models/Class";
import { CustomGroup } from "../models/CustomGroup";
import { Assignment } from "../models/Assignment";
import { Test } from "../models/Test";
import { Question } from "../models/Question";
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

  const query: any = teacher.schoolId ? { schoolId: teacher.schoolId } : { _id: { $in: teacher.classIds } };
  const classes = await Class.find(query);
  const classIds = classes.map(c => c._id);
  const students = await StudentProfile.find({ classId: { $in: classIds } });
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

  const school = teacher.schoolId ? await mongoose.model("School").findById(teacher.schoolId) : null;
  const grades = [...new Set(classes.map(c => c.grade))].sort((a,b) => Number(a)-Number(b));

  return res.json({
    totalStudents: students.length,
    classes: classes.length,
    activeAssignments,
    completedAssignments,
    averageScore,
    board: school?.board || "N/A",
    grades: grades.length ? grades.join(", ") : "N/A",
    primarySubject: teacher.subjects?.[0] || "N/A"
  });
}

export async function getTeacherStudents(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const query: any = teacher.schoolId ? { schoolId: teacher.schoolId } : { _id: { $in: teacher.classIds } };
  const classes = await Class.find(query);
  const classIds = classes.map(c => c._id);

  const students = await StudentProfile.find({ classId: { $in: classIds } }).populate(
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

export async function getTeacherClasses(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const query: any = {};
  if (teacher.schoolId) {
    query.schoolId = teacher.schoolId;
  } else {
    query._id = { $in: teacher.classIds };
  }

  const classes = await Class.find(query).sort({ grade: 1, section: 1 });
  return res.json(classes);
}

export async function getTeacherSubjectAnalytics(req: Request, res: Response) {
  const teacher = await TeacherProfile.findById(req.params.id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const query: any = teacher.schoolId ? { schoolId: teacher.schoolId } : { _id: { $in: teacher.classIds } };
  const classes = await Class.find(query);
  const classIds = classes.map(c => c._id);
  const students = await StudentProfile.find({ classId: { $in: classIds } });
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

  const query: any = teacher.schoolId ? { schoolId: teacher.schoolId } : { _id: { $in: teacher.classIds } };
  const classes = await Class.find(query);
  const classIds = classes.map(c => c._id);
  const students = await StudentProfile.find({ classId: { $in: classIds } });
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
  try {
    const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
    const filter: Record<string, unknown> = {};
    if (req.query.teacherId) filter.teacherId = req.query.teacherId;

    const [total, assignments] = await Promise.all([
      Assignment.countDocuments(filter),
      Assignment.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ]);
    return res.json({ data: assignments, page, limit, total });
  } catch (error) {
    console.error("Error in listAssignments:", error);
    return res.status(500).json({ error: "Failed to list assignments" });
  }
}

export async function createAssignment(req: Request, res: Response) {
  try {
    console.log("Creating assignment with body:", JSON.stringify(req.body, null, 2));

    // Validate target IDs
    const { target } = req.body;
    if (target.type === "class" && target.classIds) {
      target.classIds = target.classIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
    }
    if (target.type === "students" && target.studentIds) {
      target.studentIds = target.studentIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
    }
    if (target.type === "group" && target.groupId && !mongoose.Types.ObjectId.isValid(target.groupId)) {
      target.groupId = undefined;
    }

    // Trim string fields
    if (req.body.subject) req.body.subject = req.body.subject.trim();
    if (req.body.chapter) req.body.chapter = req.body.chapter.trim();
    if (req.body.topic) req.body.topic = req.body.topic.trim();

    // Robust date parsing for dueDate
    if (typeof req.body.dueDate === 'string' && req.body.dueDate.includes('/')) {
      const parts = req.body.dueDate.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        req.body.dueDate = new Date(y, m - 1, d);
      }
    }

    const assignment = await Assignment.create(req.body);
    console.log("Assignment created successfully:", assignment._id);

    // Automatically create tests for targeted students
    const { subject, chapter, topic, difficulty, questionCount } = req.body;
    let studentIds: mongoose.Types.ObjectId[] = [];

    if (target.type === "class" && target.classIds && target.classIds.length > 0) {
      const students = await StudentProfile.find({ classId: { $in: target.classIds } });
      studentIds = students.map(s => s._id as mongoose.Types.ObjectId);
    } else if (target.type === "students" && target.studentIds && target.studentIds.length > 0) {
      studentIds = target.studentIds.map((id: string) => new mongoose.Types.ObjectId(id));
    } else if (target.type === "group" && target.groupId) {
      const group = await CustomGroup.findById(target.groupId);
      if (group && group.studentIds) {
        studentIds = group.studentIds;
      }
    }

    if (studentIds.length > 0) {
      // Update assignment counts
      assignment.totalStudents = studentIds.length;
      assignment.notStarted = studentIds.length;
      await assignment.save();

      // Fetch questions once for all students to ensure they get the same test
      const query: Record<string, any> = {};
      if (subject) query.subject = { $regex: `^${subject}$`, $options: "i" };
      query.grade = Number(req.body.grade) || 11;
      
      // Get board from school
      const schoolId = req.body.schoolId || (await TeacherProfile.findById(assignment.teacherId))?.schoolId;
      if (schoolId) {
        const school = await mongoose.model("School").findById(schoolId);
        if (school && school.board) {
          query.board = { $regex: `^${school.board}$`, $options: "i" };
        }
      }

      if (chapter) query.chapter = { $regex: `^${chapter}$`, $options: "i" };
      if (topic) query.topic = { $regex: `^${topic}$`, $options: "i" };
      if (difficulty) query.difficulty = { $regex: `^${difficulty}$`, $options: "i" };

      const questions = await Question.aggregate([
        { $match: query },
        { $sample: { size: Number(questionCount) || 10 } },
      ]);

      if (questions.length > 0) {
        const testQuestions = questions.map((q: any) => ({
          originalQuestionId: q._id,
          body: q.body,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        }));

        // Create a Test record for each student
        const testPromises = studentIds.map(studentId =>
          Test.create({
            studentId,
            assignmentId: assignment._id,
            subject,
            chapter,
            topic,
            difficulty,
            status: "Pending",
            questions: testQuestions,
          })
        );
        await Promise.all(testPromises);
        console.log(`Created ${studentIds.length} test records for assignment ${assignment._id}`);
      } else {
        console.warn("No questions found for assignment parameters, tests not created.");
        return res.status(201).json({ 
          ...assignment.toObject(), 
          warning: "Assignment created, but no matching questions were found to generate student tests. Please check your subject/chapter/topic/grade."
        });
      }
    }

    return res.status(201).json(assignment);
  } catch (error: any) {
    console.error("Error in createAssignment:", error);
    return res.status(error.name === "ValidationError" ? 400 : 500).json({ 
      error: error.message || "Failed to create assignment" 
    });
  }
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
