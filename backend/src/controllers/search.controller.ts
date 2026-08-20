import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { semanticSearch } from "../services/search/semantic-search.service.js";

export const semanticSearchController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
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

  const query =
    typeof req.query.q === "string"
      ? req.query.q
      : "";

  const limitValue =
    typeof req.query.limit === "string"
      ? Number(req.query.limit)
      : 5;

  if (!query.trim()) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Query parameter 'q' is required",
      },
    });
    return;
  }

  if (
    !Number.isInteger(limitValue) ||
    limitValue < 1 ||
    limitValue > 20
  ) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "limit must be an integer between 1 and 20",
      },
    });
    return;
  }

  const results = await semanticSearch(
    repositoryId,
    req.userId,
    query.trim(),
    limitValue,
  );

  res.status(200).json({
    success: true,
    data: {
      repositoryId,
      query: query.trim(),
      results,
    },
  });
};