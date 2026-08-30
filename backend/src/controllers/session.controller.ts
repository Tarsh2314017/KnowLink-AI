import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Session } from "../models/Session";


//Get All Session
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


//Get One Session
export const getSessions = async (
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

    const sessions = await Session.find({
      userId: req.userId,
    }).sort({
      updatedAt: -1,
    });

    res.status(200).json({
      success: true,
      sessions: sessions.map((session) => ({
        id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get sessions error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSession = async (
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

    const session = await Session.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//Update Session
export const updateSession = async (
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
    const { title } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Session title is required",
      });
      return;
    }

    const session = await Session.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      {
        title: title.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      session: {
        id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update session error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//Delete Session
export const deleteSession = async (
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

    const session = await Session.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Delete session error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};