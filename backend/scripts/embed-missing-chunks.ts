import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";
import { createEmbedding } from "../src/services/ai.service.js";

type MissingChunk = {
  id: string;
  content: string;
};

const main = async () => {
  const chunks = await prisma.$queryRaw<MissingChunk[]>`
    SELECT
      "id",
      "content"
    FROM "CodeChunk"
    WHERE "embedding" IS NULL
    ORDER BY "createdAt"
  `;

  console.log(`Found ${chunks.length} chunks without embeddings.`);

  let completed = 0;

  for (const chunk of chunks) {
    try {
      const embedding = await createEmbedding(chunk.content);

      if (embedding.length !== 384) {
        throw new Error(
          `Expected 384 dimensions, received ${embedding.length}`,
        );
      }

      const vectorLiteral = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        UPDATE "CodeChunk"
        SET
          "embedding" = ${vectorLiteral}::vector,
          "updatedAt" = NOW()
        WHERE "id" = ${chunk.id}
      `;

      const verification = await prisma.$queryRaw<
        Array<{ embedding: string | null }>
      >`
        SELECT
          "embedding"::text AS embedding
        FROM "CodeChunk"
        WHERE "id" = ${chunk.id}
      `;

      if (
        verification.length === 0 ||
        !verification[0]?.embedding
      ) {
        throw new Error(
          "Embedding update completed but vector could not be read back from the database.",
        );
      }

      completed++;

      console.log(
        `Embedded ${completed}/${chunks.length}`,
      );
    } catch (error) {
      console.error(
        `Failed chunk ${chunk.id}:`,
        error,
      );
    }
  }

  console.log(
    `Completed: ${completed}/${chunks.length}`,
  );

  const totals = await prisma.$queryRaw<
    Array<{
      total: number;
      embedded: number;
    }>
  >`
    SELECT
      COUNT(*)::int AS total,
      COUNT("embedding")::int AS embedded
    FROM "CodeChunk"
  `;

  console.log("Embedding database verification:", totals);
};

main()
  .catch((error) => {
    console.error("Embedding script failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });