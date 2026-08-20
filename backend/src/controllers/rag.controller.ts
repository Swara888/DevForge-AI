import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { retrieveRelevantCode } from "../services/rag/rag.service.js";

import { buildCodeContext } from "../services/rag/context-builder.service.js";
import { generateCodeAnswer } from "../services/rag/answer.service.js";

export const searchRepositoryCode = async (
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
    const { query, limit } = req.body;

    if (typeof query !== "string" || !query.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "query is required",
        },
      });
      return;
    }

    const parsedLimit =
      limit === undefined ? 5 : Number(limit);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 10
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "limit must be between 1 and 10",
        },
      });
      return;
    }

    const results = await retrieveRelevantCode(
      repositoryId,
      req.userId,
      query,
      parsedLimit,
    );

    res.status(200).json({
      success: true,
      data: {
        query: query.trim(),
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const askRepositoryQuestion = async (
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

    if (typeof question !== "string" || !question.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "question is required",
        },
      });
      return;
    }

    const results = await retrieveRelevantCode(
      repositoryId,
      req.userId,
      question,
      5,
    );

    const context = buildCodeContext(results);

    const answer = await generateCodeAnswer(
      question,
      context,
    );

    res.status(200).json({
      success: true,
      data: {
        question: question.trim(),
        answer,
        sources: results,
      },
    });
  } catch (error) {
    next(error);
  }
};