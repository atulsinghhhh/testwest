import type { Request, Response } from "express";
import { User } from "../models/User";

export async function getMe(req: Request, res: Response) {
  return res.json(req.user);
}

export async function updateMe(req: Request, res: Response) {
  const updates = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    avatarUrl: req.body.avatarUrl,
    bio: req.body.bio,
    phone: req.body.phone,
    city: req.body.city,
  };

  const user = await User.findByIdAndUpdate(req.user?._id, updates, { new: true }).select(
    "-passwordHash",
  );

  return res.json(user);
}
