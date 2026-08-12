import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (req, res, next) => {
  const id = req.header("X-Request-ID") ?? randomUUID();

  res.setHeader("X-Request-ID", id);

  next();
};