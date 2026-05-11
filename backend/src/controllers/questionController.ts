import type { Request, Response } from "express";
import { Question } from "../models/Question";
import { getPagination } from "../middleware/pagination";

export async function listQuestions(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query as Record<string, unknown>);
  const filter: Record<string, unknown> = {};
  if (req.query.board) filter.board = req.query.board;
  if (req.query.grade) filter.grade = Number(req.query.grade);
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.chapter) filter.chapter = req.query.chapter;
  if (req.query.topic) filter.topic = req.query.topic;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;

  const [total, questions] = await Promise.all([
    Question.countDocuments(filter),
    Question.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
  ]);

  return res.json({ data: questions, page, limit, total });
}

export async function getQuestion(req: Request, res: Response) {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ error: "Question not found" });
  return res.json(question);
}

export async function createQuestion(req: Request, res: Response) {
  const question = await Question.create(req.body);
  return res.status(201).json(question);
}

export async function updateQuestion(req: Request, res: Response) {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!question) return res.status(404).json({ error: "Question not found" });
  return res.json(question);
}

export async function deleteQuestion(req: Request, res: Response) {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ error: "Question not found" });
  return res.json({ message: "Question deleted" });
}
