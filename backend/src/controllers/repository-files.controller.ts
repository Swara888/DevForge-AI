import type {
  NextFunction,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  getRepositoryFiles,
  getRepositoryFile,
} from "../services/repository-files.service.js";

export const listRepositoryFiles = async (
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

    const repositoryId = String(
      req.params.repositoryId,
    );

    const result = await getRepositoryFiles(
      req.userId,
      repositoryId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepositoryFileById = async (
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

    const repositoryId = String(
      req.params.repositoryId,
    );

    const fileId = String(
      req.params.fileId,
    );

    const result = await getRepositoryFile(
      req.userId,
      repositoryId,
      fileId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};