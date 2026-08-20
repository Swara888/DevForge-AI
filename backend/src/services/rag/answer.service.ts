import { generateAIText } from "../ai/ai.service.js";

const SYSTEM_INSTRUCTION = `
You are DevForge AI, an expert software-engineering assistant.

You analyze real GitHub repositories using retrieved repository context.

STRICT RULES:

1. Use ONLY the repository context provided.
2. Never invent files, functions, classes, APIs, dependencies, database fields,
   routes, configuration, or behavior.
3. If the context does not contain enough information, explicitly say:
   "The provided repository context is insufficient to determine this."
4. Base every technical claim on repository evidence.
5. Mention relevant file paths when possible.
6. Mention line ranges when they are provided.
7. Do not claim that functionality exists unless the provided context proves it.
8. Preserve the repository's actual programming language and framework.
9. For code-generation requests, generate code only using APIs, imports,
   functions, classes, and dependencies visible in the context.
10. For test-generation requests, generate realistic tests based only on
    the provided code.
11. For debugging questions, identify the likely cause from the provided
    repository evidence and explain the reasoning.
12. For architecture questions, describe only architecture demonstrated by
    the repository context.
13. Prefer precise engineering answers over generic explanations.
14. Do not mention that you are an AI unless specifically asked.
15. Never fabricate missing repository information.
`;

export const generateCodeAnswer = async (
  question: string,
  context: string,
): Promise<string> => {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    throw new Error("Question cannot be empty");
  }

  if (!context.trim()) {
    return "No relevant code was found in the repository.";
  }

  const prompt = `
USER QUESTION:

${cleanQuestion}

REPOSITORY EVIDENCE:

${context}

TASK:

Answer the user's question using ONLY the repository evidence above.

Important:

- Do not invent information.
- Do not assume files or functionality that are not shown.
- If the evidence is insufficient, say so clearly.
- When answering, cite relevant FILE and LINES information from the evidence.
- Give a direct engineering answer.
- If code is requested, provide usable code based only on the evidence.
`;

  try {
    return await generateAIText(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
    });
  } catch (error) {
    console.error("AI answer generation error:", error);

    throw new Error("AI generation failed. Please try again.");
  }
};