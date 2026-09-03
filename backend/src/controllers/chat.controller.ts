import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Session } from "../models/Session";
import { generateAnswer } from "../services/gemini.service";
import { Message } from "../models/Message";
import { retrieveRelevantChunks } from "../services/retrieval.service";

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
    
    const relevantChunks = await retrieveRelevantChunks(
      sessionId,
      req.userId,
      question.trim(),
      5
    );
    if (relevantChunks.length === 0) {
      res.status(400).json({
      success: false,
      message: "No relevant source content was found",
    });
    return;
  }
  const context = relevantChunks
    .map(
        (chunk, index) =>
          `[Retrieved Chunk ${index + 1} | Similarity: ${chunk.score.toFixed(4)}]\n${chunk.text}`
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