import { Router } from "express";

import { semanticSearchController } from "../controllers/search.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = Router();

router.get(
  "/repositories/:repositoryId/semantic",
  requireAuth,
  asyncHandler(semanticSearchController),
);

export default router;