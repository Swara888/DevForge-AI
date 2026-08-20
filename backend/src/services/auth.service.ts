import { prisma } from "../lib/prisma.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/jwt.js";

export const registerUser = async (
  email: string,
  password: string,
  name?: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  const accessToken = generateAccessToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    accessToken,
  };
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await comparePassword(
    password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    accessToken,
  };
};

export const getCurrentUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};