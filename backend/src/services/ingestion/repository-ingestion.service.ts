import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { prisma } from "../../lib/prisma.js";
import { createEmbedding } from "../ai.service.js";
import { chunkCode } from "../chunking/chunking.service.js";
import { scanRepository } from "./file-scanner.service.js";

const hashContent = (content: string): string =>
  crypto.createHash("sha256").update(content).digest("hex");

export const ingestRepository = async (
  repositoryId: string,
  repositoryPath: string,
): Promise<void> => {
  const repository = await prisma.repository.findUnique({
    where: {
      id: repositoryId,
    },
  });

  if (!repository) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  await prisma.repository.update({
    where: {
      id: repositoryId,
    },
    data: {
      status: "PROCESSING",
    },
  });

  try {
    const files = await scanRepository(repositoryPath);

    console.log(`Found ${files.length} supported files.`);

    for (const file of files) {
      const contentHash = hashContent(file.content);

      const repositoryFile = await prisma.repositoryFile.upsert({
        where: {
          repositoryId_path: {
            repositoryId,
            path: file.path,
          },
        },
        update: {
          language: file.language,
          size: file.size,
          contentHash,
        },
        create: {
          repositoryId,
          path: file.path,
          language: file.language,
          size: file.size,
          contentHash,
        },
      });

      await prisma.codeChunk.deleteMany({
        where: {
          fileId: repositoryFile.id,
        },
      });

      const chunks = chunkCode(file.content);

      console.log(
        `${file.path}: ${chunks.length} chunk(s)`,
      );

      for (const chunk of chunks) {
        const embedding = await createEmbedding(chunk.content);

        const vectorLiteral = `[${embedding.join(",")}]`;

        await prisma.$executeRaw`
        INSERT INTO "CodeChunk"
            ("id", "repositoryId", "fileId", "content", "startLine", "endLine", "chunkIndex", "createdAt", "updatedAt", "embedding")
        VALUES
            (
            ${crypto.randomUUID()},
            ${repositoryId},
            ${repositoryFile.id},
            ${chunk.content},
            ${chunk.startLine},
            ${chunk.endLine},
            ${chunk.chunkIndex},
            NOW(),
            NOW(),
            ${vectorLiteral}::vector
            )
        `;
      }
    }

    await prisma.repository.update({
      where: {
        id: repositoryId,
      },
      data: {
        status: "READY",
      },
    });

    console.log("Repository ingestion completed.");
  } catch (error) {
    await prisma.repository.update({
      where: {
        id: repositoryId,
      },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
};