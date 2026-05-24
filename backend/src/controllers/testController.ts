import type { Request, Response } from "express";
import { Test } from "../models/Test";
import { Question } from "../models/Question";
import { getPagination } from "../middleware/pagination";
import { generateQuestions } from "../services/aiService";

function sanitizeTest(test: any) {
  const sanitized = test.toObject ? test.toObject() : JSON.parse(JSON.stringify(test));
  sanitized.id = sanitized._id;
  if (sanitized.status !== "Completed") {
    sanitized.questions = sanitized.questions.map((q: any) => {
      // Use destructuring to ensure we get all data except sensitive fields
      const { answer, explanation, ...rest } = q;
      return {
        ...rest,
        id: rest.id || rest._id || rest.originalQuestionId,
      };
    });
  }
  return sanitized;
}

export async function createTest(req: Request, res: Response) {
  const {
    studentId,
    board,
    grade,
    subject,
    chapter,
    topic,
    subtopic,
    difficulty,
    questionTypes,
    count,
  } = req.body;

  const effectiveStudentId = studentId || req.user?._id;
  if (!effectiveStudentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  const query: Record<string, unknown> = {};
  if (board) query.board = board;
  if (grade) query.grade = grade;
  if (subject) query.subject = subject;
  if (chapter) query.chapter = chapter;
  if (topic) query.topic = topic;
  if (subtopic) query.subtopic = subtopic;
  if (difficulty) query.difficulty = difficulty;
  if (questionTypes && questionTypes.length) query.type = { $in: questionTypes };

  const questions = await Question.aggregate([
    { $match: query },
    { $sample: { size: Number(count) || 10 } },
  ]);

  if (!questions.length) {
    return res.status(404).json({ error: "No questions found for the given criteria" });
  }

  const testQuestions = questions.map((q: any) => ({
    originalQuestionId: q._id,
    type: q.type,
    body: q.body,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }));

  const test = await Test.create({
    studentId: effectiveStudentId,
    subject,
    chapter,
    topic,
    subtopic,
    difficulty,
    status: "Pending",
    questions: testQuestions,
  });

  return res.status(201).json(sanitizeTest(test));
}

export async function listTests(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const filter: Record<string, unknown> = {};
  if (req.query.studentId) filter.studentId = req.query.studentId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.subject) filter.subject = req.query.subject;

  const [total, tests] = await Promise.all([
    Test.countDocuments(filter),
    Test.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return res.json({ data: tests.map(sanitizeTest), page, limit, total });
}

export async function getTest(req: Request, res: Response) {
  const test = await Test.findById(req.params.id);
  if (!test) return res.status(404).json({ error: "Test not found" });
  return res.json(sanitizeTest(test));
}

export async function autosaveResponse(req: Request, res: Response) {
  const { givenAnswer, timeSpentSeconds, flagged } = req.body;
  const updateObj: Record<string, unknown> = {};
  if (givenAnswer !== undefined) updateObj["questions.$.givenAnswer"] = givenAnswer;
  if (timeSpentSeconds !== undefined) updateObj["questions.$.timeSpentSeconds"] = timeSpentSeconds;
  if (flagged !== undefined) updateObj["questions.$.flagged"] = flagged;

  const test = await Test.findOneAndUpdate(
    { _id: req.params.id, "questions._id": req.params.qid },
    { $set: updateObj, status: "In progress" },
    { new: true },
  );

  if (!test) return res.status(404).json({ error: "Test or question not found" });
  return res.json(sanitizeTest(test));
}

export async function submitTest(req: Request, res: Response) {
  const test = await Test.findById(req.params.id);
  if (!test) return res.status(404).json({ error: "Test not found" });

  let correctCount = 0;
  let answered = 0;
  test.questions.forEach((q: any) => {
    if (q.givenAnswer === null || q.givenAnswer === undefined) return;
    answered += 1;
    const correct = JSON.stringify(q.givenAnswer) === JSON.stringify(q.answer);
    q.isCorrect = correct;
    if (correct) correctCount += 1;
  });

  test.status = "Completed";
  test.score = test.questions.length ? (correctCount / test.questions.length) * 100 : 0;
  test.accuracy = answered ? (correctCount / answered) * 100 : 0;
  test.submittedAt = new Date();

  await test.save();
  return res.json(test);
}

export async function generateTestSeries(req: Request, res: Response) {
  const {
    studentId,
    board,
    grade,
    subject,
    chapter,
    topic,
    subtopic,
    difficulty,
    questionTypes,
    count,
  } = req.body;

  const effectiveStudentId = studentId || req.user?._id;
  if (!effectiveStudentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  try {
    // 1. Generate questions using AI
    const questions = await generateQuestions({
      board,
      grade,
      subject,
      chapter,
      topic,
      subtopic,
      difficulty: difficulty || "Medium",
      count: Number(count) || 5,
      types: questionTypes && questionTypes.length ? questionTypes : ["MCQ"],
    });

    // 2. Create the test
    const testQuestions = questions.map((q: any) => ({
      originalQuestionId: q._id,
      type: q.type,
      body: q.body,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    }));

    const test = await Test.create({
      studentId: effectiveStudentId,
      subject,
      chapter,
      topic,
      subtopic,
      difficulty,
      status: "Pending",
      questions: testQuestions,
    });

    return res.status(201).json(sanitizeTest(test));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
