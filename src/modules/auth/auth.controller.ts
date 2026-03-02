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
