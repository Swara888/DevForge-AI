import { prisma } from "../../lib/prisma.js";
import { retrieveRelevantCode } from "../rag/rag.service.js";
import { generateCodeAnswer } from "../rag/answer.service.js";

export const generateRepositoryTest = async (
  repositoryId: string,
  userId: string,
): Promise<{
  id: string;
  repositoryId: string;
  filePath: string | null;
  testCode: string;
}> => {
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

  const results = await retrieveRelevantCode(
    repositoryId,
    userId,
    "Find important application code that would benefit from automated tests. Focus on main application logic, APIs, services, controllers, validation, database operations, and important functions.",
    5,
  );

  if (results.length === 0) {
    throw new Error(
      "No indexed code was found. Please index the repository first.",
    );
  }

  const context = results
    .map(
      (result) =>
        `FILE: ${result.filePath}\n` +
        `LINES: ${result.startLine ?? "?"}-${result.endLine ?? "?"}\n` +
        `${result.content}`,
    )
    .join("\n\n---\n\n");

  const prompt = `
Generate automated tests for the repository code provided below.

Repository:
${repository.owner}/${repository.name}

Requirements:
- Base the tests only on the provided repository context.
- Do not invent files, functions, APIs, frameworks, or dependencies.
- Identify the most important testable code from the provided context.
- Generate realistic tests for that code.
- Include normal cases and important edge/error cases where supported.
- Use the testing framework that can be determined from the provided code.
- Return ONLY the test code.
- Do not wrap the answer in Markdown code fences.
- Do not include explanations.

Repository context:

${context}
`;

  const testCode = await generateCodeAnswer(
    "Generate automated tests for the repository code.",
    prompt,
  );

  const firstFile = results[0]?.filePath ?? null;

  const generatedTest = await prisma.generatedTest.create({
    data: {
      userId,
      repositoryId,
      filePath: firstFile,
      testCode: testCode.trim(),
      status: "GENERATED",
    },
  });

  return {
    id: generatedTest.id,
    repositoryId: generatedTest.repositoryId,
    filePath: generatedTest.filePath,
    testCode: generatedTest.testCode,
  };
};