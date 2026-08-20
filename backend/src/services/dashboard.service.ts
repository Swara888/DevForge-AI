import {prisma} from "../lib/prisma.js";

export const getDashboardStats = async (
  userId: string,
) => {
  const [
    repositories,
    codeFiles,
    aiQuestions,
    codeReviews,
    recentRepositories,
  ] = await Promise.all([
    // Total repositories imported by this user
    prisma.repository.count({
      where: {
        userId,
      },
    }),

    // Total indexed files belonging to this user's repositories
    prisma.repositoryFile.count({
      where: {
        repository: {
          userId,
        },
      },
    }),

    // AI questions asked by this user
    // We count user messages only, not AI responses.
    prisma.chatMessage.count({
      where: {
        role: "user",
        session: {
          userId,
        },
      },
    }),

    // Completed code reviews
    prisma.codeReview.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),

    // Five most recently updated repositories
    prisma.repository.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        githubRepoId: true,
        name: true,
        owner: true,
        url: true,
        description: true,
        size: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    repositories,
    codeFiles,
    aiQuestions,
    codeReviews,
    recentRepositories,
  };
};