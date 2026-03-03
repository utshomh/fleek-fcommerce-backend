import ms from "ms";
import { Request, Response } from "express";

import env from "../../utils/env";
import prisma from "../../lib/prisma";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/auth";

export const signUp = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  try {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail)
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });

    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone)
      return res
        .status(400)
        .json({ success: false, message: "Phone number already in use" });

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashed,
        photoUrl: `https://ui-avatars.com/api/?name=${name}`,
      },
    });

    res.json({ success: true, userId: user.id });
  } catch (err) {
    console.error(err);

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

    const refreshToken = await generateRefreshToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(env.REFRESH_TOKEN_EXPIRES),
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const refreshTokenMaxAge = parseInt(
      ms(parseInt(env.REFRESH_TOKEN_EXPIRES)),
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: refreshTokenMaxAge,
      })
      .json({ success: true, accessToken });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!existingToken)
      return res.status(401).json({ success: false, message: "Token invalid" });

    const payload = await verifyRefreshToken(refreshToken);

    const userId = payload.userId;

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const newRefreshToken = await generateRefreshToken(userId);
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(env.REFRESH_TOKEN_EXPIRES),
    );

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: userId,
        expiresAt,
      },
    });

    const refreshTokenMaxAge = parseInt(
      ms(parseInt(env.REFRESH_TOKEN_EXPIRES)),
    );

    const accessToken = await generateAccessToken(userId);

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: refreshTokenMaxAge,
      })
      .json({ success: true, accessToken });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = (req as any).userId;
    const dataToUpdate = { ...req.body };

    if (req.file) {
      dataToUpdate.photoUrl = `${env.SITE_URL}/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    const id = (req as any).userId;

    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        userId: id,
      },
    });

    if (!refreshToken) {
      return res.status(404).json({
        message: "Refresh token not found",
      });
    }

    return res.status(204);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
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
