import { api } from "./api";
import type {
  AskRepositoryResponse,
  SearchRepositoryResponse,
} from "../types/rag";

export const searchRepositoryCode = async (
  repositoryId: string,
  query: string,
  token: string,
  limit = 5,
): Promise<SearchRepositoryResponse> => {
  const response = await api.post<SearchRepositoryResponse>(
    `/repositories/${repositoryId}/search`,
    {
      query,
      limit,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const askRepositoryQuestion = async (
  repositoryId: string,
  question: string,
  token: string,
): Promise<AskRepositoryResponse> => {
  const response = await api.post<AskRepositoryResponse>(
    `/repositories/${repositoryId}/ask`,
    {
      question,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};