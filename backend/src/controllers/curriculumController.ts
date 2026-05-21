import type { Request, Response } from "express";
import { Question } from "../models/Question";

export async function getBoards(req: Request, res: Response) {
  try {
    const rawBoards = await Question.distinct("board");
    // Standard boards to always include
    const standardBoards = ["CBSE", "ICSE", "IGCSE", "IB", "State Board"];
    
    // Normalize variants like "CBSE Board" to "CBSE"
    const normalized = rawBoards.map(b => {
      if (!b) return b;
      if (b.toLowerCase().includes("cbse")) return "CBSE";
      if (b.toLowerCase().includes("icse")) return "ICSE";
      return b;
    });
    
    const uniqueBoards = [...new Set([...standardBoards, ...normalized])].filter(b => b !== null && b !== "");
    return res.json(uniqueBoards);
  } catch (error: any) {
    console.error("Error in getBoards:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getGrades(req: Request, res: Response) {
  try {
    // Return all grades from 1 to 12 as requested
    const allGrades = Array.from({ length: 12 }, (_, i) => i + 1);
    return res.json(allGrades);
  } catch (error: any) {
    console.error("Error in getGrades:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getSubjects(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = {};
    const grade = req.query.grade || req.query.gradeId;
    const board = req.query.board || req.query.boardId;
    
    if (grade && !isNaN(Number(grade))) filter.grade = Number(grade);
    if (board && board !== "undefined") filter.board = board;
    
    console.log("Fetching subjects with filter:", filter);
    const subjects = await Question.distinct("subject", filter);
    return res.json(subjects.filter(s => s !== null && s !== ""));
  } catch (error: any) {
    console.error("Error in getSubjects:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getChapters(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = {};
    const grade = req.query.grade || req.query.gradeId;
    const board = req.query.board || req.query.boardId;
    const subject = req.query.subject || req.query.subjectId;
    
    if (grade && !isNaN(Number(grade))) filter.grade = Number(grade);
    if (board && board !== "undefined") filter.board = board;
    if (subject && subject !== "undefined") filter.subject = subject;
    
    const chapters = await Question.distinct("chapter", filter);
    return res.json(chapters.filter(c => c !== null && c !== ""));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getTopics(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = {};
    const chapter = req.query.chapter || req.query.chapterId;
    const subject = req.query.subject || req.query.subjectId;
    
    if (chapter && chapter !== "undefined") filter.chapter = chapter;
    if (subject && subject !== "undefined") filter.subject = subject;
    
    const topics = await Question.distinct("topic", filter);
    return res.json(topics.filter(t => t !== null && t !== ""));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getSubtopics(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = {};
    const topic = req.query.topic || req.query.topicId;
    const chapter = req.query.chapter || req.query.chapterId;
    
    if (topic && topic !== "undefined") filter.topic = topic;
    if (chapter && chapter !== "undefined") filter.chapter = chapter;
    
    const subtopics = await Question.distinct("subtopic", filter);
    return res.json(subtopics.filter(s => s !== null && s !== ""));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getQuestionCount(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.subtopic) filter.subtopic = req.query.subtopic;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const count = await Question.countDocuments(filter);
    return res.json({ count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
