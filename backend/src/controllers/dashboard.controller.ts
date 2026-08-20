import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  getDashboardStats,
} from "../services/dashboard.service.js";

export const getDashboardStatsController = async (
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

    const stats = await getDashboardStats(
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};