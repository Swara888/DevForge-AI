import { prisma } from "../../lib/prisma.js";
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

interface ReviewChunk {
  chunkId: string;
  fileId: string;
  filePath: string;
  content: string;
  startLine: number | null;
  endLine: number | null;
}

const REVIEW_SYSTEM_INSTRUCTION = `
You are DevForge AI, a senior software engineer performing
an evidence-based code review of a real GitHub repository.

Your job is to find genuine problems in the repository code.

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
10. If evidence is insufficient, do not report the issue.
11. Return ONLY JSON.
12. NEVER use Markdown code fences.
13. NEVER add explanatory text before or after the JSON.
14. JSON strings must use valid JSON escaping.
15. Do not put unescaped line breaks inside JSON strings.
16. Do not use trailing commas.
17. If there are no genuine findings, return an empty findings array.

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
  let cleaned = response.trim();

  // Remove common Markdown code fences.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Remove accidental leading/trailing text around the JSON object.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI did not return a JSON object");
  }

  cleaned = cleaned.slice(firstBrace, lastBrace + 1).trim();

  return cleaned;
};

/**
 * Parse the AI response.
 *
 * The AI is instructed to return strict JSON, but models can
 * occasionally return slightly malformed JSON. We first attempt
 * normal JSON.parse. If that fails, we try a few safe cleanup
 * operations before giving up.
 */
const parseAIJson = (response: string): unknown => {
  const extracted = extractJson(response);

  // First attempt: strict JSON.
  try {
    return JSON.parse(extracted);
  } catch (firstError) {
    console.warn(
      "Initial AI JSON parsing failed. Attempting safe cleanup...",
    );

    let repaired = extracted;

    // Remove BOM if present.
    repaired = repaired.replace(/^\uFEFF/, "");

    // Convert smart quotes that sometimes appear in model output.
    repaired = repaired
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");

    // Remove trailing commas before } or ].
    repaired = repaired.replace(
      /,\s*([}\]])/g,
      "$1",
    );

    try {
      return JSON.parse(repaired);
    } catch (secondError) {
      console.error(
        "AI returned invalid JSON.",
        {
          originalError: firstError,
          repairedError: secondError,
          responsePreview: response.slice(0, 3000),
        },
      );

      throw new Error(
        "AI returned invalid JSON for the code review.",
      );
    }
  }
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

IMPORTANT:
Return ONLY one valid JSON object.

Do NOT use Markdown.
Do NOT use code fences.
Do NOT write any explanation outside the JSON.
Do NOT use trailing commas.
All strings must use valid JSON escaping.

Return EXACTLY this structure:

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

If no genuine issue can be established from the provided context,
return:

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
- Return ONLY valid JSON.

REPOSITORY CONTEXT:

${context}
`;
};

/**
 * Fetch indexed code directly from the repository.
 *
 * Code review should not depend on semantic similarity retrieval.
 * The repository has already been indexed into CodeChunk.
 */
const getIndexedReviewChunks = async (
  repositoryId: string,
  filePath?: string,
): Promise<ReviewChunk[]> => {
  if (filePath) {
    const rows = await prisma.$queryRaw<ReviewChunk[]>`
      SELECT
        cc."id" AS "chunkId",
        cc."fileId" AS "fileId",
        rf."path" AS "filePath",
        cc."content" AS "content",
        cc."startLine" AS "startLine",
        cc."endLine" AS "endLine"
      FROM "CodeChunk" cc
      INNER JOIN "RepositoryFile" rf
        ON rf."id" = cc."fileId"
      WHERE
        cc."repositoryId" = ${repositoryId}
        AND rf."path" = ${filePath}
        AND cc."content" IS NOT NULL
        AND LENGTH(TRIM(cc."content")) > 0
      ORDER BY
        rf."path",
        cc."startLine"
      LIMIT 50
    `;

    return rows;
  }

  const rows = await prisma.$queryRaw<ReviewChunk[]>`
    SELECT
      cc."id" AS "chunkId",
      cc."fileId" AS "fileId",
      rf."path" AS "filePath",
      cc."content" AS "content",
      cc."startLine" AS "startLine",
      cc."endLine" AS "endLine"
    FROM "CodeChunk" cc
    INNER JOIN "RepositoryFile" rf
      ON rf."id" = cc."fileId"
    WHERE
      cc."repositoryId" = ${repositoryId}
      AND cc."content" IS NOT NULL
      AND LENGTH(TRIM(cc."content")) > 0
    ORDER BY
      rf."path",
      cc."startLine"
    LIMIT 50
  `;

  return rows;
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

  // Verify repository belongs to authenticated user.
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

  // Retrieve indexed code directly.
  const selectedChunks =
    await getIndexedReviewChunks(
      repositoryId,
      scope === "file"
        ? filePath?.trim()
        : undefined,
    );

  console.log(
    "CODE REVIEW INDEXED CHUNKS:",
    {
      repositoryId,
      userId,
      scope,
      filePath,
      retrievedCount:
        selectedChunks.length,
      retrievedFiles: [
        ...new Set(
          selectedChunks.map(
            (chunk) =>
              chunk.filePath,
          ),
        ),
      ],
    },
  );

  if (selectedChunks.length === 0) {
    throw new Error(
      scope === "file"
        ? `No indexed code was found for file: ${filePath}`
        : "No indexed code was found for this repository.",
    );
  }

  const context = selectedChunks
    .map(
      (chunk) =>
        `FILE: ${chunk.filePath}\n` +
        `LINES: ${
          chunk.startLine ?? "?"
        }-${chunk.endLine ?? "?"}\n` +
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

  const review =
    await prisma.codeReview.create({
      data: {
        repositoryId,
        userId,
        status: "PENDING",
      },
    });

  try {
    const aiResponse =
      await generateAIText(
        prompt,
        {
          systemInstruction:
            REVIEW_SYSTEM_INSTRUCTION,
        },
      );

    console.log(
      "AI CODE REVIEW RESPONSE PREVIEW:",
      aiResponse.slice(0, 3000),
    );

    const parsed =
      parseAIJson(aiResponse);

    const validated =
      validateAIReview(parsed);

    const allowedFilePaths =
      new Set(
        selectedChunks.map(
          (chunk) =>
            chunk.filePath,
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
          summary:
            validated.summary,

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
          updatedReview.summary ??
          "",

        status:
          updatedReview.status,
      },

      findings:
        finalFindings,
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