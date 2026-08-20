
import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  getGitHubRepository,
  listGitHubRepositories,
} from "../services/github.service.js";

import {
  getRepositoryById,
  getUserRepositories,
  importRepository,
} from "../services/repository.service.js";

import { ingestRepository } from "../services/repository-ingestion.service.js";

const parseGitHubUrl = (
  value: string,
): { owner: string; repo: string } | null => {
  try {
    const url = new URL(value.trim());

    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return null;
    }

    const parts = url.pathname
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo,
    };
  } catch {
    return null;
  }
};

export const ingestImportedRepository = async (
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

    const result = await ingestRepository(
      req.userId,
      repositoryId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const listAvailableRepositories = async (
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

    const repositories = await listGitHubRepositories(req.userId);

    res.status(200).json({
      success: true,
      data: {
        repositories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableRepository = async (
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

    const owner = String(req.params.owner);
    const repo = String(req.params.repo);

    const repository = await getGitHubRepository(
      req.userId,
      owner,
      repo,
    );

    res.status(200).json({
      success: true,
      data: {
        repository,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const importGitHubRepository = async (
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

    const { owner, repo, url } = req.body;

    let repositoryOwner: string;
    let repositoryName: string;

    // New URL-based import
    if (typeof url === "string" && url.trim()) {
      const parsed = parseGitHubUrl(url);

      if (!parsed) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_GITHUB_URL",
            message:
              "Please provide a valid GitHub repository URL.",
          },
        });
        return;
      }

      repositoryOwner = parsed.owner;
      repositoryName = parsed.repo;
    }
    // Keep the old owner/repo API working
    else if (
      typeof owner === "string" &&
      typeof repo === "string" &&
      owner.trim() &&
      repo.trim()
    ) {
      repositoryOwner = owner.trim();
      repositoryName = repo.trim();
    } else {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message:
            "Provide either a GitHub repository URL or owner and repo.",
        },
      });
      return;
    }

    // Verify that the repository exists and is accessible.
    const githubRepository = await getGitHubRepository(
      req.userId,
      repositoryOwner,
      repositoryName,
    );

    // Save it under the currently authenticated DevForge user.
    const repository = await importRepository(
      req.userId,
      githubRepository.owner,
      githubRepository.name,
    );

    res.status(201).json({
      success: true,
      data: {
        repository,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listImportedRepositories = async (
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

    const repositories = await getUserRepositories(req.userId);

    res.status(200).json({
      success: true,
      data: {
        repositories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getImportedRepository = async (
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

    res.status(200).json({
      success: true,
      data: {
        repository,
      },
    });
  } catch (error) {
    next(error);
  }
};

