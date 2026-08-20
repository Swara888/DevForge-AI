export interface CodeChunkData {
  content: string;
  startLine: number;
  endLine: number;
  chunkIndex: number;
}

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 200;

export const chunkCode = (
  content: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
): CodeChunkData[] => {
  if (!content.trim()) {
    return [];
  }

  const lines = content.split(/\r?\n/);

  const chunks: CodeChunkData[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < lines.length) {
    const end = Math.min(start + chunkSize, lines.length);

    const chunkContent = lines.slice(start, end).join("\n");

    if (chunkContent.trim()) {
      chunks.push({
        content: chunkContent,
        startLine: start + 1,
        endLine: end,
        chunkIndex,
      });
    }

    if (end >= lines.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
    chunkIndex++;
  }

  return chunks;
};