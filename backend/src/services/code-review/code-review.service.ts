import { prisma } from "../../lib/prisma.js";
import { retrieveRelevantCode } from "../rag/rag.service.js";
import { generateAIText } from "../ai/ai.service.js";

export type ReviewScope = "repository" | "file";

export interface CodeReviewFindingInput {
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  filePath: string | null;
  recommendation: string;
}

export interface CodeReviewResult {
  review: {
    id: string;
    repositoryId: string;
    summary: string;
    status: string;
  };
  findings: CodeReviewFindingInput[];
}

const REVIEW_SYSTEM_INSTRUCTION = `
You are DevForge AI, a senior software engineer performing
evidence-based code review of a real GitHub repository.

Your job is to find genuine problems in the code provided to you.

STRICT RULES:

1. Use ONLY the repository context provided.
2. Never invent files, functions, classes, APIs, dependencies,
   frameworks, database fields, or behavior.
3. Never report an issue without evidence in the provided code.
4. Do not give generic best-practice advice as a finding.
5. Focus on concrete and actionable problems.
6. Look for:
   - security vulnerabilities
   - authentication and authorization problems
   - input validation issues
   - unsafe data handling
   - broken logic
   - incorrect API behavior
   - database problems
   - error handling problems
   - performance problems
   - maintainability problems
   - important testing gaps
7. A possible issue must be supported by actual repository code.
8. Do not duplicate findings.
9. Keep file paths exactly as provided.
10. If the evidence is insufficient, do not report the issue.
11. Return ONLY valid JSON.
12. Do not wrap JSON in Markdown code fences.

Severity:

CRITICAL:
A severe vulnerability, major data-loss risk, or system-breaking problem.

HIGH:
A serious security, correctness, reliability, or application issue.

MEDIUM:
A meaningful bug, maintainability, validation, performance,
or reliability issue.

LOW:
A minor but concrete issue supported by the code.

Prefer fewer high-confidence findings over many speculative findings.
`;

const extractJson = (response: string): string => {
  const cleaned = response
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI did not return valid JSON");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

const validateAIReview = (
  value: unknown,
): {
  summary: string;
  findings: CodeReviewFindingInput[];
} => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid AI review response");
  }

  const data = value as Record<string, unknown>;

  if (typeof data.summary !== "string") {
    throw new Error("AI review summary is missing");
  }

  if (!Array.isArray(data.findings)) {
    throw new Error("AI review findings are missing");
  }

  const validSeverities = new Set([
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ]);

  const findings: CodeReviewFindingInput[] = [];

  for (const rawFinding of data.findings) {
    if (!rawFinding || typeof rawFinding !== "object") {
      continue;
    }

    const finding = rawFinding as Record<string, unknown>;

    if (
      typeof finding.title !== "string" ||
      !finding.title.trim()
    ) {
      continue;
    }

    if (
      typeof finding.explanation !== "string" ||
      !finding.explanation.trim()
    ) {
      continue;
    }

    if (
      typeof finding.severity !== "string" ||
      !validSeverities.has(finding.severity)
    ) {
      continue;
    }

    const filePath =
      typeof finding.filePath === "string" &&
      finding.filePath.trim()
        ? finding.filePath.trim()
        : null;

    const suggestion =
      typeof finding.suggestion === "string" &&
      finding.suggestion.trim()
        ? finding.suggestion.trim()
        : null;

    findings.push({
      title: finding.title.trim(),
      description: finding.explanation.trim(),
      severity:
        finding.severity as CodeReviewFindingInput["severity"],
      filePath,
      recommendation:
        suggestion ??
        "Review the identified code and apply an appropriate fix based on the repository's existing architecture.",
    });
  }

  return {
    summary: data.summary.trim(),
    findings,
  };
};

const buildReviewPrompt = (
  repositoryName: string,
  owner: string,
  scope: ReviewScope,
  filePath: string | undefined,
  context: string,
): string => {
  const scopeInstruction =
    scope === "file"
      ? `
Review ONLY this file:

${filePath}

Do not report issues from other files.
`
      : `
Review the provided repository context as a whole.
`;

  return `
Perform an evidence-based code review of:

Repository:
${owner}/${repositoryName}

${scopeInstruction}

Return EXACTLY this JSON structure:

{
  "summary": "Short overall assessment of the reviewed code.",
  "findings": [
    {
      "filePath": "exact/path/from/context",
      "severity": "HIGH",
      "title": "Short concrete issue title",
      "explanation": "Explain the actual problem using evidence from the provided code.",
      "suggestion": "Give a concrete fix supported by the repository context."
    }
  ]
}

If no genuine issue can be established from the provided context:

{
  "summary": "No concrete issues were identified in the reviewed context.",
  "findings": []
}

IMPORTANT:

- filePath must come from the supplied context.
- Do not invent line numbers.
- Do not invent files.
- Do not invent dependencies.
- Do not assume undocumented behavior.
- Do not report generic style preferences.
- Do not report theoretical vulnerabilities without evidence.
- Prefer high-confidence findings.
- Do not duplicate findings.
- Return ONLY JSON.

REPOSITORY CONTEXT:

${context}
`;
};

export const runCodeReview = async (
  repositoryId: string,
  userId: string,
  scope: ReviewScope = "repository",
  filePath?: string,
): Promise<CodeReviewResult> => {
  if (!repositoryId.trim()) {
    throw new Error("Repository ID is required");
  }

  if (!userId.trim()) {
    throw new Error("User ID is required");
  }

  if (
    scope !== "repository" &&
    scope !== "file"
  ) {
    throw new Error(
      "Review scope must be either repository or file",
    );
  }

  if (
    scope === "file" &&
    !filePath?.trim()
  ) {
    throw new Error(
      "filePath is required when review scope is file",
    );
  }

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

  const query =
    scope === "file"
      ? `Perform a detailed code review of ${filePath}`
      : `
Perform a senior-level repository code review.

Focus on:
security,
correctness,
reliability,
validation,
API behavior,
database operations,
error handling,
performance,
maintainability,
and important testing gaps.
`;

  const retrievedChunks = await retrieveRelevantCode(
    repositoryId,
    userId,
    query,
    scope === "file" ? 8 : 10,
  );

  const selectedChunks =
    scope === "file" && filePath
      ? retrievedChunks.filter(
          (chunk) =>
            chunk.filePath === filePath,
        )
      : retrievedChunks;

  if (selectedChunks.length === 0) {
    throw new Error(
      scope === "file"
        ? `No indexed code was found for file: ${filePath}`
        : "No indexed code was found. Please index the repository first.",
    );
  }

  const context = selectedChunks
    .map(
      (chunk) =>
        `FILE: ${chunk.filePath}\n` +
        `LINES: ${chunk.startLine ?? "?"}-${chunk.endLine ?? "?"}\n` +
        `${chunk.content}`,
    )
    .join("\n\n---\n\n");

  const prompt = buildReviewPrompt(
    repository.name,
    repository.owner,
    scope,
    filePath,
    context,
  );

  const review = await prisma.codeReview.create({
    data: {
      repositoryId,
      userId,
      status: "PENDING",
    },
  });

  try {
    const aiResponse = await generateAIText(
      prompt,
      {
        systemInstruction:
          REVIEW_SYSTEM_INSTRUCTION,
      },
    );

    const parsed = JSON.parse(
      extractJson(aiResponse),
    );

    const validated =
      validateAIReview(parsed);

    const allowedFilePaths = new Set(
      selectedChunks.map(
        (chunk) => chunk.filePath,
      ),
    );

    const findings =
      validated.findings.filter(
        (finding) =>
          finding.filePath === null ||
          allowedFilePaths.has(
            finding.filePath,
          ),
      );

    const finalFindings =
      findings.slice(0, 20);

    const updatedReview =
      await prisma.codeReview.update({
        where: {
          id: review.id,
        },
        data: {
          status: "COMPLETED",
          summary: validated.summary,
          findings: {
            create:
              finalFindings.map(
                (finding) => ({
                  filePath:
                    finding.filePath,
                  severity:
                    finding.severity,
                  title:
                    finding.title,
                  explanation:
                    finding.description,
                  suggestion:
                    finding.recommendation,
                }),
              ),
          },
        },
        include: {
          findings: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    return {
      review: {
        id: updatedReview.id,
        repositoryId:
          updatedReview.repositoryId,
        summary:
          updatedReview.summary ?? "",
        status:
          updatedReview.status,
      },
      findings: finalFindings,
    };
  } catch (error) {
    console.error(
      "AI code review error:",
      error,
    );

    await prisma.codeReview.update({
      where: {
        id: review.id,
      },
      data: {
        status: "FAILED",
      },
    });

    throw new Error(
      "Code review generation failed. Please try again.",
    );
  }
};

export const getCodeReview = async (
  repositoryId: string,
  userId: string,
  reviewId: string,
) => {
  const review =
    await prisma.codeReview.findFirst({
      where: {
        id: reviewId,
        repositoryId,
        userId,
      },
      include: {
        findings: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!review) {
    throw new Error(
      "Code review not found",
    );
  }

  return review;
};