import { Router } from "express";

import authRoutes from "./auth.routes.js";
import githubRoutes from "./github.routes.js";
import healthRoutes from "./health.routes.js";
import repositoryRoutes from "./repository.routes.js";
import searchRoutes from "./search.routes.js";
import ragRoutes from "./rag.routes.js";
import answerRoutes from "./answer.routes.js";
import codeReviewRoutes from "./code-review.routes.js";
import documentationRoutes from "./documentation.routes.js";
import generatedTestRoutes from "./generated-test.routes.js";
import chatRoutes from "./chat.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import repositoryFilesRoutes from "./repository-files.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/github", githubRoutes);
router.use("/repositories", repositoryRoutes);
router.use("/search", searchRoutes);
router.use("/rag", ragRoutes);
router.use("/ask", answerRoutes);
router.use("/review", codeReviewRoutes);
router.use("/documentation", documentationRoutes);
router.use("/tests", generatedTestRoutes);
router.use("/chat", chatRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/", repositoryFilesRoutes);

export default router;