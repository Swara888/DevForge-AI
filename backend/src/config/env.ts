import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const port = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT must be a valid number between 1 and 65535");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};

export const getRequiredEnv = requiredEnv;