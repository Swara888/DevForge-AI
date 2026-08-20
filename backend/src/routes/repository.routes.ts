import { Router } from "express";

import {
  getAvailableRepository,
  getImportedRepository,
  importGitHubRepository,
  ingestImportedRepository,
  listAvailableRepositories,
  listImportedRepositories,
} from "../controllers/repository.controller.js";

import {
  listRepositoryFiles,
  getRepositoryFileById,
} from "../controllers/repository-files.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/github",
  listAvailableRepositories,
);

router.post(
  "/:repositoryId/ingest",
  ingestImportedRepository,
);

/*
 * Repository files
 *
 * IMPORTANT:
 * These routes must come BEFORE
 * /:repositoryId
 */
router.get(
  "/:repositoryId/files",
  listRepositoryFiles,
);

router.get(
  "/:repositoryId/files/:fileId",
  getRepositoryFileById,
);

router.get(
  "/github/:owner/:repo",
  getAvailableRepository,
);

router.post(
  "/import",
  importGitHubRepository,
);

router.get(
  "/",
  listImportedRepositories,
);

router.get(
  "/:repositoryId",
  getImportedRepository,
);

export default router;