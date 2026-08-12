import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./errors/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRateLimiter } from "./middleware/rate-limit.js";
import { requestId } from "./middleware/request-id.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(requestId);

app.use(apiRateLimiter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "DevForge AI API",
  });
});

app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;