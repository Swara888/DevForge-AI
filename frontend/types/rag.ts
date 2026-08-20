export interface CodeSearchResult {
  chunkId: string;
  fileId: string;
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
  similarity: number;
}

export interface SearchRepositoryResponse {
  success: boolean;
  data: {
    query: string;
    results: CodeSearchResult[];
  };
}

export interface AskRepositoryResponse {
  success: boolean;
  data: {
    question: string;
    answer: string;
    sources: CodeSearchResult[];
  };
}