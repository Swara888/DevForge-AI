import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";
import { createEmbedding } from "../src/services/ai.service.js";

const main = async () => {
  const chunk = await prisma.codeChunk.findFirst();

  if (!chunk) {
    throw new Error(
      "No CodeChunk found. Ingest a repository before running this test.",
    );
  }

  console.log("Testing chunk:");
  console.log(`File ID: ${chunk.fileId}`);
  console.log(`Chunk ID: ${chunk.id}`);
  console.log(`Content length: ${chunk.content.length}`);

  const embedding = await createEmbedding(chunk.content);

  console.log(`Embedding dimensions: ${embedding.length}`);

  const vector = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    UPDATE "CodeChunk"
    SET "embedding" = ${vector}::vector
    WHERE "id" = ${chunk.id}
  `;

  console.log("Embedding stored successfully.");

  await prisma.$disconnect();
};

main().catch(async (error) => {
  console.error("Embedding test failed:");
  console.error(error);

  await prisma.$disconnect();
  process.exit(1);
});