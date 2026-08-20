import { api } from "./api";

export interface RepositoryFile {
  id: string;
  path: string;
  language: string | null;
  size: number | null;
  contentHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryFilesResponse {
  success: boolean;
  data: {
    repository: {
      id: string;
      name: string;
      owner: string;
    };
    files: RepositoryFile[];
  };
}

export interface RepositoryFileResponse {
  success: boolean;
  data: {
    repository: {
      id: string;
      name: string;
      owner: string;
    };
    file: {
      id: string;
      path: string;
      language: string | null;
      size: number | null;
      contentHash: string | null;
      createdAt: string;
      updatedAt: string;
      content: string;
      chunks: {
        content: string;
        startLine: number | null;
        endLine: number | null;
        chunkIndex: number;
      }[];
    };
  };
}

export const getRepositoryFiles = async (
  repositoryId: string,
  token: string,
): Promise<RepositoryFilesResponse> => {
  const response =
    await api.get<RepositoryFilesResponse>(
      `/repositories/${repositoryId}/files`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
};

export const getRepositoryFile = async (
  repositoryId: string,
  fileId: string,
  token: string,
): Promise<RepositoryFileResponse> => {
  const response =
    await api.get<RepositoryFileResponse>(
      `/repositories/${repositoryId}/files/${fileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
};