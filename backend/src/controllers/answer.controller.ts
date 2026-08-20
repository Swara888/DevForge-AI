import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getRepositoryById } from "../services/repository.service.js";
import { answerRepositoryQuestion } from "../services/rag/rag.service.js";

export const answerRepositoryQuestionController = async (
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
    const { question } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "question is required",
        },
      });
      return;
    }

    const repository = await getRepositoryById(
      req.userId,
      repositoryId,
    );

    if (!repository) {
      res.status(404).json({
        success: false,
        error: {
          code: "REPOSITORY_NOT_FOUND",
          message: "Repository not found",
        },
      });
      return;
    }

    const result = await answerRepositoryQuestion(
      repositoryId,
      req.userId,
      question,
    );

    res.status(200).json({
      success: true,
      data: {
        question: question.trim(),
        ...result,
      },
    });
  } catch (error) {
    next(error);
  }
};