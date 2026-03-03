import { Request, Response } from "express";

import prisma from "../../lib/prisma";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({});

    return res.status(200).json({
      message: "User fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...req.body,
      },
    });

    res.status(200).json({
      success: true,
      data: updateUser,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
