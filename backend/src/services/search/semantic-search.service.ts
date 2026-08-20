import { prisma } from "../../lib/prisma.js";
import { createEmbedding } from "../ai.service.js";

export interface SemanticSearchResult {
  chunkId: string;
  fileId: string;
  content: string;
  startLine: number | null;
  endLine: number | null;
  similarity: number;
}

export const semanticSearch = async (
  repositoryId: string,
  userId: string,
  query: string,
  limit = 5,
): Promise<SemanticSearchResult[]> => {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    throw new Error("Search query cannot be empty");
  }

  if (limit < 1 || limit > 20) {
    throw new Error("Limit must be between 1 and 20");
  }

  console.log("SEARCH REPOSITORY CHECK:", {
    repositoryId,
    userId,
  });

  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
    select: {
      id: true,
    },
  });

  console.log("SEARCH REPOSITORY RESULT:", repository);

  if (!repository) {
    throw new Error("Repository not found");
  }

  const embedding = await createEmbedding(cleanQuery);

  if (embedding.length !== 384) {
    throw new Error(
      `Expected 384-dimensional embedding, received ${embedding.length}`,
    );
  }

  const vector = `[${embedding.join(",")}]`;

  const results = await prisma.$queryRaw<SemanticSearchResult[]>`
    SELECT
      cc."id" AS "chunkId",
      cc."fileId" AS "fileId",
      cc."content",
      cc."startLine",
      cc."endLine",
      1 - (cc."embedding" <=> ${vector}::vector) AS "similarity"
    FROM "CodeChunk" cc
    INNER JOIN "RepositoryFile" rf
      ON rf."id" = cc."fileId"
    WHERE
      rf."repositoryId" = ${repositoryId}
      AND cc."embedding" IS NOT NULL
    ORDER BY cc."embedding" <=> ${vector}::vector
    LIMIT ${limit}
  `;

  console.log("SEMANTIC SEARCH RESULTS:", {
    repositoryId,
    userId,
    query: cleanQuery,
    resultCount: results.length,
  });

  return results;
};