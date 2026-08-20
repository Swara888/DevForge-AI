import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  createChatSession,
  getChatSession,
  getRepositoryChatSessions,
  sendChatMessage,
} from "../services/chat/chat.service.js";

export const createSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const repositoryId = String(req.params.repositoryId);
    const { title } = req.body;

    const session = await createChatSession(
      repositoryId,
      req.userId,
      typeof title === "string" ? title : undefined,
    );

    res.status(201).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const sessionId = String(req.params.sessionId);
    const { content } = req.body;

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "content is required",
        },
      });
      return;
    }

    const result = await sendChatMessage(
      sessionId,
      req.userId,
      content,
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const sessionId = String(req.params.sessionId);

    const session = await getChatSession(
      sessionId,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listRepositorySessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const repositoryId = String(req.params.repositoryId);

    const sessions = await getRepositoryChatSessions(
      repositoryId,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: {
        sessions,
      },
    });
  } catch (error) {
    next(error);
  }
};