import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AuthTokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    {
      userId,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    },
  );
};

export const verifyAccessToken = (
  token: string,
): AuthTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
};