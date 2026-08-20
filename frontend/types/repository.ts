export interface Repository {
  id: string;
  githubRepoId: string;
  name: string;
  owner: string;
  url: string;
  description: string | null;
  size: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryListResponse {
  success: boolean;
  data: {
    repositories: Repository[];
  };
}

export interface RepositoryResponse {
  success: boolean;
  data: {
    repository: Repository;
  };
}

export interface ImportRepositoryResponse {
  success: boolean;
  data: {
    repository: Repository;
  };
}

export interface IngestRepositoryResponse {
  success: boolean;
  data: {
    repositoryId: string;
    status: string;
    importedFiles: number;
    skippedFiles: number;
  };
}