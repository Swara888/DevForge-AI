import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { generateRepositoryDocumentation } from "../services/documentation/documentation.service.js";

export const generateDocumentation = async (
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

    const documentation =
      await generateRepositoryDocumentation(
        repositoryId,
        req.userId,
      );

    res.status(201).json({
      success: true,
      data: {
        documentation,
      },
    });
  } catch (error) {
    next(error);
  }
};