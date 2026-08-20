import { Router } from "express";

import { generateDocumentation } from "../controllers/documentation.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/repositories/:repositoryId/generate",
  generateDocumentation,
);

export default router;