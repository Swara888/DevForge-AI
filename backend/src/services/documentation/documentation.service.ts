import { prisma } from "../../lib/prisma.js";
import { retrieveRelevantCode } from "../rag/rag.service.js";
import { generateCodeAnswer } from "../rag/answer.service.js";

export const generateRepositoryDocumentation = async (
  repositoryId: string,
  userId: string,
): Promise<{
  id: string;
  repositoryId: string;
  content: string;
}> => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const results = await retrieveRelevantCode(
    repositoryId,
    userId,
    "Explain the repository architecture, important modules, main application flow, APIs, database models, configuration, and important implementation details.",
    10,
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
Generate professional technical documentation for this repository.

Repository:
${repository.owner}/${repository.name}

Create documentation with these sections:

# Overview
# Architecture
# Project Structure
# Main Application Flow
# APIs
# Database
# Important Modules
# Configuration
# Setup and Installation
# Development
# Important Implementation Details

Rules:
- Base the documentation only on the provided repository context.
- Do not invent technologies, endpoints, files, or features.
- Clearly say when something cannot be determined from the indexed code.
- Write professional Markdown suitable for a GitHub README or engineering documentation.

Repository context:

${context}
`;

  const content = await generateCodeAnswer(
    "Generate repository documentation.",
    prompt,
  );

  const documentation = await prisma.documentation.create({
    data: {
      userId,
      repositoryId,
      type: "README",
      title: "Repository Documentation",
      content,
    },
  });

  return {
    id: documentation.id,
    repositoryId: documentation.repositoryId,
    content: documentation.content,
  };
};