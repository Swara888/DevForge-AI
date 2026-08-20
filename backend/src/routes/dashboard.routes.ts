import { Router } from "express";

import {
  getDashboardStatsController,
} from "../controllers/dashboard.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/stats",
  getDashboardStatsController,
);

export default router;