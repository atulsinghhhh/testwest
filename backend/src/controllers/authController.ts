import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import env from "../config/env";
import { User } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { ParentProfile } from "../models/ParentProfile";
import { TeacherProfile } from "../models/TeacherProfile";
import { School } from "../models/School";

function signToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: "1d" });
}

export async function register(req: Request, res: Response) {
  const { email, password, role, firstName, lastName, profile = {} } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    firstName,
    lastName,
    avatarUrl: profile.avatarUrl || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    city: profile.city || "",
  });

  if (role === "STUDENT" || role === "SOLO") {
    await StudentProfile.create({
      user: user._id,
      grade: profile.grade,
      board: profile.board,
      avatarUrl: profile.avatarUrl || "",
      schoolId: profile.schoolId || null,
      classId: profile.classId || null,
      section: profile.section || "",
      rollNo: profile.rollNo || "",
    });
  }

  if (role === "PARENT") {
    await ParentProfile.create({ user: user._id, children: [] });
  }

  if (role === "TEACHER") {
    await TeacherProfile.create({
      user: user._id,
      subjects: profile.subjects || [],
      classIds: profile.classIds || [],
      schoolId: profile.schoolId || null,
      experienceYears: profile.experienceYears || 0,
    });
  }

  if (role === "SCHOOL") {
    const school = await School.create({
      name: `${firstName} ${lastName}`.trim(),
      board: profile.board || "CBSE",
      city: profile.city || "",
      principal: `${firstName} ${lastName}`.trim(),
    });
    user.schoolId = String(school._id);
    await user.save();
  }

  const token = signToken(String(user._id), user.role);
  
  let userProfile = null;
  if (user.role === "STUDENT" || user.role === "SOLO") {
    userProfile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === "PARENT") {
    userProfile = await ParentProfile.findOne({ user: user._id });
  } else if (user.role === "TEACHER") {
    userProfile = await TeacherProfile.findOne({ user: user._id });
  } else if (user.role === "SCHOOL" && user.schoolId) {
    userProfile = await School.findById(user.schoolId);
  }

  return res.status(201).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      city: user.city,
      profile: userProfile,
    },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const identifier = email.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { studentId: identifier.toUpperCase() }],
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(String(user._id), user.role);

  let profile = null;
  if (user.role === "STUDENT" || user.role === "SOLO") {
    profile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === "PARENT") {
    profile = await ParentProfile.findOne({ user: user._id });
  } else if (user.role === "TEACHER") {
    profile = await TeacherProfile.findOne({ user: user._id });
  } else if (user.role === "SCHOOL" && user.schoolId) {
    profile = await School.findById(user.schoolId);
  }

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      city: user.city,
      profile,
    },
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let profile = null;
  if (req.user.role === "STUDENT" || req.user.role === "SOLO") {
    profile = await StudentProfile.findOne({ user: req.user._id });
  } else if (req.user.role === "PARENT") {
    profile = await ParentProfile.findOne({ user: req.user._id });
  } else if (req.user.role === "TEACHER") {
    profile = await TeacherProfile.findOne({ user: req.user._id });
  } else if (req.user.role === "SCHOOL" && req.user.schoolId) {
    profile = await School.findById(req.user.schoolId);
  }

  return res.json({
    id: req.user._id,
    ...req.user.toObject(),
    profile,
  });
}
