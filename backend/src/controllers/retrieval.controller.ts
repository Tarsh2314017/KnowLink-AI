import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { retrieveRelevantChunks } from "../services/retrieval.service";

export const testRetrieval = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { sessionId, question } = req.body;

    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!sessionId || !question) {
      res.status(400).json({
        success: false,
        message: "sessionId and question are required",
      });
      return;
    }

    const chunks = await retrieveRelevantChunks(
      sessionId,
      req.userId,
      question,
      5
    );

    res.status(200).json({
      success: true,
      count: chunks.length,
      chunks,
    });
  } catch (error) {
    console.error("Retrieval test error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};