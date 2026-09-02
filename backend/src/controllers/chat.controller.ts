import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Session } from "../models/Session";
import { Source } from "../models/Source";
import { generateAnswer } from "../services/gemini.service";
import { Message } from "../models/Message";

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

    // Save user's question
    await Message.create({
      sessionId,
      userId: req.userId,
      role: "user",
      content: question.trim(),
    });

    // Save assistant's answer
    await Message.create({
      sessionId,
      userId: req.userId,
      role: "assistant",
      content: answer,
    });

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

export const getChatHistory = async (
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

    const { sessionId } = req.params;

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

    const messages = await Message.find({
      sessionId,
      userId: req.userId,
    }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get chat history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
};

export const deleteChatHistory = async (
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

    const { sessionId } = req.params;

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

    await Message.deleteMany({
      sessionId,
      userId: req.userId,
    });

    res.status(200).json({
      success: true,
      message: "Chat history deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete chat history",
    });
  }
};