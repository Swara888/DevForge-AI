const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  repositoryId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface CreateSessionResponse {
  success: boolean;
  data: {
    session: ChatSession;
  };
}

export interface ListSessionsResponse {
  success: boolean;
  data: {
    sessions: ChatSession[];
  };
}

export interface GetSessionResponse {
  success: boolean;
  data: {
    session: ChatSession;
  };
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    sessionId: string;
    message: ChatMessage;
  };
}

export const createChatSession = async (
  repositoryId: string,
  token: string,
  title?: string,
): Promise<CreateSessionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/chat/repositories/${repositoryId}/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create chat session.",
    );
  }

  return response.json();
};

export const listRepositorySessions = async (
  repositoryId: string,
  token: string,
): Promise<ListSessionsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/chat/repositories/${repositoryId}/sessions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load chat sessions.",
    );
  }

  return response.json();
};

export const getChatSession = async (
  sessionId: string,
  token: string,
): Promise<GetSessionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/chat/sessions/${sessionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load chat session.",
    );
  }

  return response.json();
};

export const sendChatMessage = async (
  sessionId: string,
  token: string,
  content: string,
): Promise<SendMessageResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to send chat message.",
    );
  }

  return response.json();
};