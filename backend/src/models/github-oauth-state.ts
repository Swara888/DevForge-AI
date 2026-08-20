export interface GitHubOAuthState {
  userId: string;
  state: string;
  expiresAt: number;
}