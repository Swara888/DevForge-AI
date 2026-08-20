
import { Octokit } from "@octokit/rest";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

const GITHUB_SCOPES = ["read:user", "user:email", "repo"];

export const getGitHubAuthorizationUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubCallbackUrl,
    scope: GITHUB_SCOPES.join(" "),
    state,
  });

  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
};

const exchangeCodeForToken = async (code: string): Promise<string> => {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange GitHub authorization code");
  }

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!data.access_token) {
    throw new Error(
      data.error_description ?? data.error ?? "GitHub authorization failed",
    );
  }

  return data.access_token;
};

export const connectGitHubAccount = async (
  userId: string,
  code: string,
) => {
  const accessToken = await exchangeCodeForToken(code);

  const octokit = new Octokit({
    auth: accessToken,
  });

  const { data: githubUser } = await octokit.rest.users.getAuthenticated();

  const account = await prisma.gitHubAccount.upsert({
    where: {
      userId,
    },
    update: {
      githubUserId: String(githubUser.id),
      username: githubUser.login,
      accessToken,
    },
    create: {
      userId,
      githubUserId: String(githubUser.id),
      username: githubUser.login,
      accessToken,
    },
    select: {
      id: true,
      githubUserId: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return account;
};

export const getGitHubAccount = async (userId: string) => {
  return prisma.gitHubAccount.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      githubUserId: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getGitHubClient = async (userId: string) => {
  const account = await prisma.gitHubAccount.findUnique({
    where: {
      userId,
    },
    select: {
      accessToken: true,
    },
  });

  console.log("GitHub lookup:", {
    userId,
    found: Boolean(account),
    hasAccessToken: Boolean(account?.accessToken),
  });

  if (!account?.accessToken) {
    throw new Error("GitHub account is not connected");
  }

  return new Octokit({
    auth: account.accessToken,
  });
};

export const listGitHubRepositories = async (userId: string) => {
  const octokit = await getGitHubClient(userId);

  const repositories =
    await octokit.rest.repos.listForAuthenticatedUser({
      visibility: "all",
      affiliation: "owner,collaborator,organization_member",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    });

  return repositories.data.map((repo) => ({
    githubRepoId: String(repo.id),
    name: repo.name,
    owner: repo.owner.login,
    url: repo.html_url,
    description: repo.description,
    size: repo.size,
    private: repo.private,
    defaultBranch: repo.default_branch,
    language: repo.language,
    updatedAt: repo.updated_at,
  }));
};

export const getGitHubRepository = async (
  userId: string,
  owner: string,
  repo: string,
) => {
  let octokit: Octokit;

  try {
    // Use the authenticated GitHub client when the user has connected GitHub.
    octokit = await getGitHubClient(userId);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "GitHub account is not connected"
    ) {
      // No OAuth connection: use GitHub's public API.
      // This allows public repositories to be imported.
      octokit = new Octokit();
    } else {
      throw error;
    }
  }

  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      githubRepoId: String(data.id),
      name: data.name,
      owner: data.owner.login,
      url: data.html_url,
      description: data.description,
      size: data.size,
      private: data.private,
      defaultBranch: data.default_branch,
      language: data.language,
      updatedAt: data.updated_at,
    };
  } catch (error: any) {
    if (error?.status === 404) {
      throw new Error(
        "GitHub repository not found or is private. Connect your GitHub account to access private repositories.",
      );
    }

    throw error;
  }
};

