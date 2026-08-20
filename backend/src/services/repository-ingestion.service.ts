import crypto from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { getGitHubClient } from "./github.service.js";

import { chunkCode } from "./chunking/chunking.service.js";

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "staticfiles",
  "static",
  "public",
  "assets",
  "cache",
  "tmp",
  "temp",
  "logs",
  "htmlcov",
  ".next",
  "coverage",
  "vendor",
  "__pycache__",
  ".venv",
  "venv",
]);

const IGNORED_FILES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "poetry.lock",
  "composer.lock",
]);

const MAX_FILE_SIZE = 500_000;
const CHUNK_SIZE = 120;
const CHUNK_OVERLAP = 20;

const shouldIgnorePath = (filePath: string): boolean => {
  const parts = filePath.split("/");

  if (parts.some((part) => IGNORED_DIRECTORIES.has(part))) {
    return true;
  }

  const fileName = parts.at(-1);

  if (fileName && IGNORED_FILES.has(fileName)) {
    return true;
  }

  return false;
};

const isSupportedSourceFile = (filePath: string): boolean => {
  const supportedExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".cs",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".swift",
    ".kt",
    ".kts",
    ".sql",
    ".html",
    ".css",
    ".scss",
    ".sass",
    ".vue",
    ".svelte",
    ".json",
    ".yaml",
    ".yml",
    ".md",
    ".txt",
    ".xml",
  ];

  return supportedExtensions.some((extension) =>
    filePath.toLowerCase().endsWith(extension),
  );
};

const detectLanguage = (filePath: string): string | null => {
  const extension = filePath.split(".").pop()?.toLowerCase();

  const languages: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
    kts: "kotlin",
    sql: "sql",
    html: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    vue: "vue",
    svelte: "svelte",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    txt: "text",
    xml: "xml",
  };

  return extension ? languages[extension] ?? null : null;
};



export const ingestRepository = async (
  userId: string,
  repositoryId: string,
) => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  await prisma.repository.update({
    where: {
      id: repository.id,
    },
    data: {
      status: "PROCESSING",
    },
  });

  try {
    const octokit = await getGitHubClient(userId);

    const { data: repositoryData } =
      await octokit.rest.repos.get({
        owner: repository.owner,
        repo: repository.name,
      });

    const defaultBranch = repositoryData.default_branch;

    const { data: tree } =
      await octokit.rest.git.getTree({
        owner: repository.owner,
        repo: repository.name,
        tree_sha: defaultBranch,
        recursive: "true",
      });

    await prisma.codeChunk.deleteMany({
      where: {
        repositoryId: repository.id,
      },
    });

    await prisma.repositoryFile.deleteMany({
      where: {
        repositoryId: repository.id,
      },
    });

    let importedFiles = 0;
    let skippedFiles = 0;
    let importedChunks = 0;

    for (const item of tree.tree) {
      if (item.type !== "blob" || !item.path || !item.sha) {
        continue;
      }

      const filePath = item.path;

      if (
        shouldIgnorePath(filePath) ||
        !isSupportedSourceFile(filePath)
      ) {
        skippedFiles += 1;
        continue;
      }

      if (item.size && item.size > MAX_FILE_SIZE) {
        skippedFiles += 1;
        continue;
      }

      const { data: blob } =
        await octokit.rest.git.getBlob({
          owner: repository.owner,
          repo: repository.name,
          file_sha: item.sha,
        });

      if (blob.encoding !== "base64") {
        skippedFiles += 1;
        continue;
      }

      const content = Buffer.from(blob.content, "base64").toString(
        "utf-8",
      );

      if (Buffer.byteLength(content, "utf-8") > MAX_FILE_SIZE) {
        skippedFiles += 1;
        continue;
      }

      const contentHash = crypto
        .createHash("sha256")
        .update(content)
        .digest("hex");

      const file = await prisma.repositoryFile.create({
        data: {
          repositoryId: repository.id,
          path: filePath,
          language: detectLanguage(filePath),
          size: Buffer.byteLength(content, "utf-8"),
          contentHash,
        },
      });

      const chunks = chunkCode(content);

      if (chunks.length > 0) {
        await prisma.codeChunk.createMany({
          data: chunks.map((chunk) => ({
            repositoryId: repository.id,
            fileId: file.id,
            content: chunk.content,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            chunkIndex: chunk.chunkIndex,
          })),
        });

        importedChunks += chunks.length;
      }

      importedFiles += 1;
    }

    await prisma.repository.update({
      where: {
        id: repository.id,
      },
      data: {
        status: "READY",
      },
    });

    return {
      repositoryId: repository.id,
      status: "READY",
      importedFiles,
      skippedFiles,
      importedChunks,
    };
  } catch (error) {
    await prisma.repository.update({
      where: {
        id: repository.id,
      },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
};