import type { RequestHandler } from "express";

import { getHealthStatus } from "../services/health.service.js";

export const healthController: RequestHandler = (_req, res) => {
  const health = getHealthStatus();

  res.status(200).json({
    success: true,
    data: health,
  });
};