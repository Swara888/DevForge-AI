import { api } from "./api";

export interface DashboardRepository {
  id: string;
  githubRepoId: string | null;
  name: string;
  owner: string;
  url: string;
  description: string | null;
  size: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  repositories: number;
  codeFiles: number;
  aiQuestions: number;
  codeReviews: number;
  recentRepositories: DashboardRepository[];
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

export const getDashboardStats = async (
  token: string,
): Promise<DashboardStatsResponse> => {
  const response =
    await api.get<DashboardStatsResponse>(
      "/dashboard/stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
};