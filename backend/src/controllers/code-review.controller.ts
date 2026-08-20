
import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getCodeReview,
  runCodeReview,
} from "../services/review/code-review.service.js";

export const createCodeReview = async (
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
    const { scope, filePath } = req.body;

    const reviewScope =
      scope === undefined ? "repository" : scope;

    if (
      reviewScope !== "repository" &&
      reviewScope !== "file"
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "scope must be repository or file",
        },
      });
      return;
    }

    if (
      reviewScope === "file" &&
      (typeof filePath !== "string" || !filePath.trim())
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "filePath is required for file review",
        },
      });
      return;
    }

    const result = await runCodeReview(
      repositoryId,
      req.userId,
      reviewScope,
      typeof filePath === "string"
        ? filePath.trim()
        : undefined,
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepositoryCodeReview = async (
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
    const reviewId = String(req.params.reviewId);

    const review = await getCodeReview(
      repositoryId,
      req.userId,
      reviewId,
    );

    res.status(200).json({
      success: true,
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

