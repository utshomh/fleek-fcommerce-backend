import { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../utils/auth";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";

export const authenticate = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const requireAdmin = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user && user.role === Role.ADMIN) {
      req.userId = req.userId;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
