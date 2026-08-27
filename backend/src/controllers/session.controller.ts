import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Session } from "../models/Session";

export const createSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { title } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Session title is required",
      });
      return;
    }

    const session = await Session.create({
      userId: req.userId,
      title: title.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      session: {
        id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create session error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};