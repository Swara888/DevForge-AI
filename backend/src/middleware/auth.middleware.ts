import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const requireAuth = (
  
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authorization = req.headers.authorization;

    

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const token = authorization.substring("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  try {
  

  const payload = verifyAccessToken(token);

  

  if (!payload.userId) {
    

    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid authentication token",
      },
    });
    return;
  }

  req.userId = payload.userId;

  

  next();
} catch (error) {
  

  res.status(401).json({
    success: false,
    error: {
      code: "UNAUTHORIZED",
      message: "Invalid or expired authentication token",
    },
  });
}
};