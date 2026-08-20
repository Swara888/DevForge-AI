import { Router } from "express";

import {
  createSession,
  getSession,
  listRepositorySessions,
  sendMessage,
} from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/repositories/:repositoryId/sessions",
  createSession,
);

router.get(
  "/repositories/:repositoryId/sessions",
  listRepositorySessions,
);

router.get(
  "/sessions/:sessionId",
  getSession,
);

router.post(
  "/sessions/:sessionId/messages",
  sendMessage,
);

export default router;