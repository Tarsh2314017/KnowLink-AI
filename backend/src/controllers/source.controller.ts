import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Session } from "../models/Session";
import { Source } from "../models/Source";
import { extractWebContent } from "../services/extraction.service";
import { validateUrl } from "../services/url.service";
import { chunkText } from "../services/chunking.service";
import { generateEmbedding } from "../services/embedding.service";

export const createSource = async (
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

    const { sessionId, url } = req.body;

    if (!sessionId || !url) {
      res.status(400).json({
        success: false,
        message: "sessionId and url are required",
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

    const validatedUrl = await validateUrl(url);

    const normalizedUrl = validatedUrl.toString();

    const existingSource = await Source.findOne({
      sessionId,
      userId: req.userId,
      url: normalizedUrl,
    });

    if (existingSource) {
      res.status(409).json({
        success: false,
        message: "This source already exists in the session",
      });
      return;
    }

    const extracted = await extractWebContent(normalizedUrl);

    if (!extracted.content.trim()) {
      res.status(422).json({
        success: false,
        message: "Unable to extract content from this URL",
      });
      return;
    }

    const chunks=chunkText(extracted.content);
    const embeddedChunks= [];
    for(const chunk of chunks){
      const embedding = await generateEmbedding(chunk);
      embeddedChunks.push({
        text: chunk,
        embedding,
      });
    }
    const source = await Source.create({
      sessionId,
      userId: req.userId,
      url: normalizedUrl,
      title: extracted.title,
      content: extracted.content,
      chunks: embeddedChunks,
    });

    res.status(201).json({
      success: true,
      message: "Source added successfully",
      source: {
        id: source._id,
        sessionId: source.sessionId,
        url: source.url,
        title: source.title,
        contentLength: source.content.length,
        createdAt: source.createdAt,
      },
    });
  } catch (error) {
    console.error("Create source error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Invalid URL")
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (
      error instanceof Error &&
      (
        error.message.includes("not allowed") ||
        error.message.includes("private IP")
      )
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (axiosError(error)) {
      res.status(422).json({
        success: false,
        message: "Unable to fetch content from the provided URL",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const axiosError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error
  );
};



export const getSessionSources = async (
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

    // Make sure the session belongs to the logged-in user
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
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      sources: sources.map((source) => ({
        id: source._id,
        sessionId: source.sessionId,
        url: source.url,
        title: source.title,
        contentLength: source.content.length,
        chunkCount: source.chunks.length,
        createdAt: source.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get session sources error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const getSource = async (
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

    const { id } = req.params;

    const source = await Source.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!source) {
      res.status(404).json({
        success: false,
        message: "Source not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      source: {
        id: source._id,
        sessionId: source.sessionId,
        url: source.url,
        title: source.title,
        content: source.content,
        chunks: source.chunks,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get source error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const deleteSource = async (
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

    const { id } = req.params;

    const source = await Source.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!source) {
      res.status(404).json({
        success: false,
        message: "Source not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Source deleted successfully",
    });
  } catch (error) {
    console.error("Delete source error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};