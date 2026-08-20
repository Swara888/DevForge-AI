
import { Router } from "express";

import { generateTest } from "../controllers/generated-test.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/repositories/:repositoryId/generate",
  generateTest,
);

export default router;

