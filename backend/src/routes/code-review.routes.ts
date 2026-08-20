
import { Router } from "express";

import {
  createCodeReview,
  getRepositoryCodeReview,
} from "../controllers/code-review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/repositories/:repositoryId/review",
  createCodeReview,
);

router.get(
  "/repositories/:repositoryId/reviews/:reviewId",
  getRepositoryCodeReview,
);

export default router;

