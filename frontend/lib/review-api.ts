
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

export interface CodeReviewFinding {
  id: string;
  reviewId: string;
  title: string;
  explanation: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  filePath: string | null;
  startLine: number | null;
  endLine: number | null;
  recommendation: string;
  createdAt: string;
}

export interface CodeReview {
  id: string;
  userId: string;
  repositoryId: string;
  status: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  findings: CodeReviewFinding[];
}

export interface CreateCodeReviewResponse {
  success: boolean;
  data: {
    review: CodeReview;
    findings?: CodeReviewFinding[];
  };
}

export interface GetCodeReviewResponse {
  success: boolean;
  data: {
    review: CodeReview;
  };
}

export const createCodeReview = async (
  repositoryId: string,
  token: string,
): Promise<CreateCodeReviewResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/review/repositories/${repositoryId}/review`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        scope: "repository",
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      errorBody || "Failed to create code review.",
    );
  }

  return response.json();
};

export const getCodeReview = async (
  repositoryId: string,
  reviewId: string,
  token: string,
): Promise<GetCodeReviewResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/review/repositories/${repositoryId}/reviews/${reviewId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      errorBody || "Failed to load code review.",
    );
  }

  return response.json();
};

