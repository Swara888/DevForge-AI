const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

export interface Documentation {
  id: string;
  repositoryId: string;
  type: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentationResponse {
  success: boolean;
  data: {
    documentation: Documentation;
  };
}

export const generateRepositoryDocumentation = async (
  repositoryId: string,
  token: string,
): Promise<DocumentationResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/documentation/repositories/${repositoryId}/generate`,
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
      errorText || "Failed to generate documentation.",
    );
  }

  return response.json();
};