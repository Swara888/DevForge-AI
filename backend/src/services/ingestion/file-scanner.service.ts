import fs from "node:fs/promises";
import path from "node:path";

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "staticfiles",
  "static",
  "public",
  "vendor",
  "cache",
  "assets",
  "tmp",
  "temp",
  "logs",
  "htmlcov",
  "coverage",
  ".next",
  ".nuxt",
  "target",
  "__pycache__",
  ".venv",
  "venv",
]);

const IGNORED_FILES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

const SUPPORTED_EXTENSIONS = new Set([
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
  ".json",
  ".yaml",
  ".yml",
  ".md",
]);

export interface ScannedFile {
  path: string;
  absolutePath: string;
  language: string | null;
  size: number;
  content: string;
}

const getLanguage = (filePath: string): string | null => {
  const extension = path.extname(filePath).toLowerCase();

  const languages: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".py": "python",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".h": "c",
    ".hpp": "cpp",
    ".cs": "csharp",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
    ".rb": "ruby",
    ".swift": "swift",
    ".kt": "kotlin",
    ".kts": "kotlin",
    ".sql": "sql",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".md": "markdown",
  };

  return languages[extension] ?? null;
};

export const scanRepository = async (
  repositoryPath: string,
): Promise<ScannedFile[]> => {
  const results: ScannedFile[] = [];

  const walk = async (currentPath: string): Promise<void> => {
    const entries = await fs.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          continue;
        }

        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (IGNORED_FILES.has(entry.name)) {
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      if (!SUPPORTED_EXTENSIONS.has(extension)) {
        continue;
      }

      const content = await fs.readFile(fullPath, "utf8");

      const relativePath = path
        .relative(repositoryPath, fullPath)
        .split(path.sep)
        .join("/");

      results.push({
        path: relativePath,
        absolutePath: fullPath,
        language: getLanguage(fullPath),
        size: Buffer.byteLength(content, "utf8"),
        content,
      });
    }
  };

  await walk(repositoryPath);

  return results;
};