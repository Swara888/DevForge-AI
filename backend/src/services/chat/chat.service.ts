import { prisma } from "../../lib/prisma.js";
import { answerRepositoryQuestion } from "../rag/rag.service.js";

export const createChatSession = async (
  repositoryId: string,
  userId: string,
  title?: string,
) => {
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

  return prisma.chatSession.create({
    data: {
      userId,
      repositoryId,
      title: title?.trim() || "New Chat",
    },
  });
};

export const sendChatMessage = async (
  sessionId: string,
  userId: string,
  content: string,
) => {
  const cleanContent = content.trim();

  if (!cleanContent) {
    throw new Error("Message cannot be empty");
  }

  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new Error("Chat session not found");
  }

  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "user",
      content: cleanContent,
    },
  });

  const result = await answerRepositoryQuestion(
    session.repositoryId,
    userId,
    cleanContent,
  );

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "assistant",
      content: result.answer,
    },
  });

  return {
    sessionId,
    message: assistantMessage,
  };
};

export const getChatSession = async (
  sessionId: string,
  userId: string,
) => {
  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!session) {
    throw new Error("Chat session not found");
  }

  return session;
};

export const getRepositoryChatSessions = async (
  repositoryId: string,
  userId: string,
) => {
  return prisma.chatSession.findMany({
    where: {
      repositoryId,
      userId,
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};