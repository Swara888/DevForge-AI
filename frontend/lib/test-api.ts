const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

export interface GeneratedTest {
  id: string;
  repositoryId: string;
  filePath: string | null;
  testCode: string;
}

export interface GeneratedTestResponse {
  success: boolean;
  data: GeneratedTest;
}

export const generateRepositoryTest = async (
  repositoryId: string,
  token: string,
): Promise<GeneratedTestResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/tests/repositories/${repositoryId}/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to generate tests.",
    );
  }

  return response.json();
};