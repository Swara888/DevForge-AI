import { prisma } from "../lib/prisma.js";
import { createEmbedding } from "./ai.service.js";

export const generateRepositoryEmbeddings = async (
  repositoryId: string,
) => {
  const chunks = await prisma.codeChunk.findMany({
    where: {
      repositoryId,
    },
    orderBy: {
      chunkIndex: "asc",
    },
  });

  let processed = 0;

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.content);

    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "CodeChunk"
      SET "embedding" = ${vector}::vector
      WHERE "id" = ${chunk.id}
    `;

    processed += 1;
  }

  return {
    repositoryId,
    totalChunks: chunks.length,
    processed,
  };
};