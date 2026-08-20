import type { RetrievedCodeChunk } from "./rag.service.js";

export const buildCodeContext = (
  chunks: RetrievedCodeChunk[],
): string => {
  if (chunks.length === 0) {
    return "No relevant code was found.";
  }

  return chunks
    .map((chunk, index) => {
      const lines =
        chunk.startLine !== null &&
        chunk.endLine !== null
          ? `Lines ${chunk.startLine}-${chunk.endLine}`
          : "Line information unavailable";

      return [
        `===== CODE RESULT ${index + 1} =====`,
        `File: ${chunk.filePath}`,
        lines,
        `Similarity: ${chunk.similarity.toFixed(4)}`,
        "",
        chunk.content,
        "",
        "===== END RESULT =====",
      ].join("\n");
    })
    .join("\n\n");
};