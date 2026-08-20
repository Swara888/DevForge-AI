import { api } from "./api";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", {
    email,
    password,
    name,
  });

  return response.data;
};

export const getCurrentUser = async (
  token: string,
): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};