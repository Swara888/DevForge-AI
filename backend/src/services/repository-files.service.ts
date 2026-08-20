import { prisma } from "../lib/prisma.js";

export const getRepositoryFiles = async (
  userId: string,
  repositoryId: string,
) => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
    select: {
      id: true,
      name: true,
      owner: true,
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const files = await prisma.repositoryFile.findMany({
    where: {
      repositoryId: repository.id,
    },
    orderBy: {
      path: "asc",
    },
    select: {
      id: true,
      path: true,
      language: true,
      size: true,
      contentHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    repository,
    files,
  };
};

export const getRepositoryFile = async (
  userId: string,
  repositoryId: string,
  fileId: string,
) => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
    select: {
      id: true,
      name: true,
      owner: true,
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const file = await prisma.repositoryFile.findFirst({
    where: {
      id: fileId,
      repositoryId: repository.id,
    },
    select: {
      id: true,
      path: true,
      language: true,
      size: true,
      contentHash: true,
      createdAt: true,
      updatedAt: true,
      codeChunks: {
        orderBy: {
          chunkIndex: "asc",
        },
        select: {
          content: true,
          startLine: true,
          endLine: true,
          chunkIndex: true,
        },
      },
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  const content = file.codeChunks
    .map((chunk) => chunk.content)
    .join("\n");

  return {
    repository,
    file: {
      id: file.id,
      path: file.path,
      language: file.language,
      size: file.size,
      contentHash: file.contentHash,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      content,
      chunks: file.codeChunks,
    },
  };
};