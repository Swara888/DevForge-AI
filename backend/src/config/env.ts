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

  corsOrigin:
    process.env.CORS_ORIGIN ?? "http://localhost:3000",

  jwtSecret: requiredEnv("JWT_SECRET"),

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ?? "7d",

  githubClientId:
    requiredEnv("GITHUB_CLIENT_ID"),

  githubClientSecret:
    requiredEnv("GITHUB_CLIENT_SECRET"),

  githubCallbackUrl:
    requiredEnv("GITHUB_CALLBACK_URL"),

  openaiApiKey:
    process.env.OPENAI_API_KEY ?? "",

  geminiApiKey:
    requiredEnv("GEMINI_API_KEY"),

  geminiModel:
    process.env.GEMINI_MODEL ?? "gemini-3.5-flash",
};

export const getRequiredEnv = requiredEnv;