import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  connectGitHubAccount,
  getGitHubAccount,
  getGitHubAuthorizationUrl,
} from "../services/github.service.js";
import {
  consumeOAuthState,
  createOAuthState,
} from "../services/github-oauth-state.service.js";

export const connectGitHub = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
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

    const state = createOAuthState(req.userId);
    const authorizationUrl = getGitHubAuthorizationUrl(state);

    res.status(200).json({
      success: true,
      data: {
        authorizationUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const githubCallback = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const code =
      typeof req.query.code === "string" ? req.query.code : null;

    const state =
      typeof req.query.state === "string" ? req.query.state : null;

    if (!code || !state) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CALLBACK",
          message: "Missing GitHub authorization code or state",
        },
      });
      return;
    }

    const userId = consumeOAuthState(state);

    if (!userId) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OAUTH_STATE",
          message: "Invalid or expired OAuth state",
        },
      });
      return;
    }

    const account = await connectGitHubAccount(userId, code);

    res.status(200).json({
      success: true,
      data: {
        account,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const githubStatus = async (
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

    const account = await getGitHubAccount(req.userId);

    res.status(200).json({
      success: true,
      data: {
        connected: Boolean(account),
        account,
      },
    });
  } catch (error) {
    next(error);
  }
};