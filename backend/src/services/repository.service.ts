import { prisma } from "../lib/prisma.js";
import {
  getGitHubRepository,
  getGitHubClient,
} from "./github.service.js";

export const importRepository = async (
  userId: string,
  owner: string,
  repo: string,
) => {
  const githubRepository = await getGitHubRepository(
    userId,
    owner,
    repo,
  );

  const repository = await prisma.repository.upsert({
    where: {
      userId_url: {
        userId,
        url: githubRepository.url,
      },
    },
    update: {
      githubRepoId: githubRepository.githubRepoId,
      name: githubRepository.name,
      owner: githubRepository.owner,
      description: githubRepository.description,
      size: githubRepository.size,
    },
    create: {
      userId,
      githubRepoId: githubRepository.githubRepoId,
      name: githubRepository.name,
      owner: githubRepository.owner,
      url: githubRepository.url,
      description: githubRepository.description,
      size: githubRepository.size,
    },
  });

  return repository;
};

export const getUserRepositories = async (userId: string) => {
  return prisma.repository.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getRepositoryById = async (
  userId: string,
  repositoryId: string,
) => {
  console.log("GET REPOSITORY DEBUG:", {
    repositoryId,
    authenticatedUserId: userId,
  });

  const repository = await prisma.repository.findUnique({
    where: {
      id: repositoryId,
    },
  });

  console.log("REPOSITORY OWNER DEBUG:", {
    repositoryUserId: repository?.userId,
  });

  if (!repository) {
    return null;
  }

  if (repository.userId !== userId) {
    console.log("REPOSITORY USER MISMATCH");
    return null;
  }

  return repository;
};