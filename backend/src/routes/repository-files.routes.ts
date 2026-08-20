import { Router } from "express";

import {
  listRepositoryFiles,
  getRepositoryFileById,
} from "../controllers/repository-files.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/repositories/:repositoryId/files",
  asyncHandler(listRepositoryFiles),
);

router.get(
  "/repositories/:repositoryId/files/:fileId",
  asyncHandler(getRepositoryFileById),
);

export default router;