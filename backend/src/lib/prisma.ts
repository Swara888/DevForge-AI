import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { getRequiredEnv } from "../config/env.js";

const pool = new Pool({
  connectionString: getRequiredEnv("DATABASE_URL"),
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});