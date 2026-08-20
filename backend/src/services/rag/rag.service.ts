import { prisma } from "../../lib/prisma.js";
import { createEmbedding } from "../ai.service.js";

import { buildCodeContext } from "./context-builder.service.js";
import { generateCodeAnswer } from "./answer.service.js";

export interface RetrievedCodeChunk {
  chunkId: string;
  fileId: string;
  filePath: string;
  content: string;
  startLine: number | null;
  endLine: number | null;
  similarity: number;
}

export const retrieveRelevantCode = async (
  repositoryId: string,
  userId: string,
  query: string,
  limit = 5,
): Promise<RetrievedCodeChunk[]> => {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    throw new Error("Query cannot be empty");
  }

  if (limit < 1 || limit > 20) {
    throw new Error("Limit must be between 1 and 20");
  }

  // 1. Verify repository ownership
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  // 2. Create query embedding
  const embedding = await createEmbedding(cleanQuery);

  if (embedding.length !== 384) {
    throw new Error(
      `Expected 384-dimensional embedding, received ${embedding.length}`,
    );
  }

  const vector = `[${embedding.join(",")}]`;

  // 3. Retrieve indexed chunks
  const rows = await prisma.$queryRaw<
    Array<{
      chunkId: string;
      fileId: string;
      filePath: string;
      content: string;
      startLine: number | null;
      endLine: number | null;
      similarity: number;
    }>
  >`
    SELECT
      cc."id" AS "chunkId",
      cc."fileId" AS "fileId",
      rf."path" AS "filePath",
      cc."content" AS "content",
      cc."startLine" AS "startLine",
      cc."endLine" AS "endLine",
      1 - (cc."embedding" <=> ${vector}::vector) AS "similarity"
    FROM "CodeChunk" cc
    INNER JOIN "RepositoryFile" rf
      ON rf."id" = cc."fileId"
    WHERE
      cc."repositoryId" = ${repositoryId}
      AND cc."embedding" IS NOT NULL
    ORDER BY cc."embedding" <=> ${vector}::vector
    LIMIT ${limit}
  `;

  console.log("RAG RETRIEVAL:", {
    repositoryId,
    userId,
    query: cleanQuery,
    requestedLimit: limit,
    retrievedCount: rows.length,
    retrievedFiles: rows.map((row) => row.filePath),
  });

  return rows.map((row) => ({
    chunkId: row.chunkId,
    fileId: row.fileId,
    filePath: row.filePath,
    content: row.content,
    startLine: row.startLine,
    endLine: row.endLine,
    similarity: Number(row.similarity),
  }));
};

export const answerRepositoryQuestion = async (
  repositoryId: string,
  userId: string,
  question: string,
): Promise<{
  answer: string;
  sources: RetrievedCodeChunk[];
}> => {
  const results = await retrieveRelevantCode(
    repositoryId,
    userId,
    question,
    5,
  );

  if (results.length === 0) {
    return {
      answer: "No relevant code was found.",
      sources: [],
    };
  }

  const context = buildCodeContext(results);

  const answer = await generateCodeAnswer(
    question,
    context,
  );

  return {
    answer,
    sources: results,
  };
};