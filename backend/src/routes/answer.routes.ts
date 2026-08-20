import { Router } from "express";

import { answerRepositoryQuestionController } from "../controllers/answer.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/repositories/:repositoryId/ask",
  answerRepositoryQuestionController,
);

export default router;