import { Request, Response } from "express";

import prisma from "../../lib/prisma";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
} from "../../utils/auth";

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        photoUrl: `https://ui-avatars.com/api/?name=${name}`,
      },
    });

    res.json({ success: true, userId: user.id });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email" });

    const valid = await comparePassword(password, user.password);
    if (!valid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });

    const accessToken = await generateAccessToken(user.id);

    res.json({ success: true, accessToken });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const id = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
