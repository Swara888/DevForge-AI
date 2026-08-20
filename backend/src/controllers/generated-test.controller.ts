
import type { Request, Response } from "express";

import { generateRepositoryTest } from "../services/testing/generated-test.service.js";

type AuthenticatedRequest = Request & {
  userId?: string;
};

export const generateTest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const repositoryId = req.params.repositoryId;

    if (typeof repositoryId !== "string") {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Repository ID is required",
        },
      });
      return;
    }

    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const generatedTest = await generateRepositoryTest(
      repositoryId,
      userId,
    );

    res.status(201).json({
      success: true,
      data: generatedTest,
    });
  } catch (error) {
    console.error("Generate test error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate test.";

    if (message === "Repository not found") {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message,
        },
      });
      return;
    }

    if (message.includes("No indexed code")) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_INDEXED_CODE",
          message,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate test.",
      },
    });
  }
};

