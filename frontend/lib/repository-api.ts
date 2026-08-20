import { api } from "./api";
import type {
  ImportRepositoryResponse,
  IngestRepositoryResponse,
  RepositoryListResponse,
  RepositoryResponse,
} from "../types/repository";

export const getRepositories = async (
  token: string,
): Promise<RepositoryListResponse> => {
  const response = await api.get<RepositoryListResponse>(
    "/repositories",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getRepository = async (
  repositoryId: string,
  token: string,
): Promise<RepositoryResponse> => {
  const response = await api.get<RepositoryResponse>(
    `/repositories/${repositoryId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const importRepository = async (
  owner: string,
  repo: string,
  token: string,
): Promise<ImportRepositoryResponse> => {
  const response = await api.post<ImportRepositoryResponse>(
    "/repositories/import",
    {
      owner,
      repo,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const ingestRepository = async (
  repositoryId: string,
  token: string,
): Promise<IngestRepositoryResponse> => {
  const response = await api.post<IngestRepositoryResponse>(
    `/repositories/${repositoryId}/ingest`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export interface GitHubRepository {
  githubRepoId: string;
  name: string;
  owner: string;
  url: string;
  description: string | null;
  size: number | null;
}

export interface GitHubRepositoryListResponse {
  success: boolean;
  data: {
    repositories: GitHubRepository[];
  };
}

export const getAvailableRepositories = async (
  token: string,
): Promise<GitHubRepositoryListResponse> => {
  const response = await api.get<GitHubRepositoryListResponse>(
    "/repositories/github",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};