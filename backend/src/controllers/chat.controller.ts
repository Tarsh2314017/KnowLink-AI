import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Session } from "../models/Session";
import { Source } from "../models/Source";
import { generateAnswer } from "../services/gemini.service";

export const askQuestion = async (
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

    const { sessionId, question } = req.body;

    if (!sessionId || !question?.trim()) {
      res.status(400).json({
        success: false,
        message: "sessionId and question are required",
      });
      return;
    }

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    const sources = await Source.find({
      sessionId,
      userId: req.userId,
    });

    if (sources.length === 0) {
      res.status(400).json({
        success: false,
        message: "No sources are available in this session",
      });
      return;
    }

    const context = sources
      .flatMap((source) =>
        source.chunks.map(
          (chunk, index) =>
            `[Source: ${source.title} | Chunk ${index + 1}]\n${chunk}`
        )
      )
      .join("\n\n");

    const answer = await generateAnswer(
      question.trim(),
      context
    );

    res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Ask question error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate answer",
    });
  }
};