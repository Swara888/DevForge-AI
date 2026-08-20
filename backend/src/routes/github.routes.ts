import { Router } from "express";

import {
  connectGitHub,
  githubCallback,
  githubStatus,
} from "../controllers/github.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/connect", requireAuth, connectGitHub);
router.get("/callback", githubCallback);
router.get("/status", requireAuth, githubStatus);

export default router;