import type { NextFunction, Request, Response } from "express";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = registerSchema.parse(req.body);

    const data = await registerUser(
      result.email,
      result.password,
      result.name,
    );

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = loginSchema.parse(req.body);

    const data = await loginUser(
      result.email,
      result.password,
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
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

    const user = await getCurrentUser(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};