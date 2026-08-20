import { Router } from "express";

import {
  askRepositoryQuestion,
  searchRepositoryCode,
} from "../controllers/rag.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/repositories/:repositoryId/search",
  searchRepositoryCode,
);

router.post(
  "/repositories/:repositoryId/ask",
  askRepositoryQuestion,
);

export default router;