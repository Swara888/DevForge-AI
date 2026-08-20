"use client";

import { useEffect, useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";

import RepositoryList from "@/components/repository/repository-list";
import {
  getAvailableRepositories,
  importRepository,
} from "@/lib/repository-api";
import { getToken } from "@/lib/auth";

type GitHubRepository = {
  githubRepoId: string;
  name: string;
  owner: string;
  url: string;
  description: string | null;
  size: number | null;
};

export default function RepositoriesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [githubRepositories, setGithubRepositories] =
    useState<GitHubRepository[]>([]);

  
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [importing, setImporting] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleConnectGitHub = async () => {
  if (!token) {
    return;
  }

  try {
    setError("");

    const response = await fetch(
      "http://localhost:5000/api/v1/github/connect",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message || "Failed to connect GitHub.",
      );
    }

    const authorizationUrl =
      data?.data?.authorizationUrl;

    if (!authorizationUrl) {
      throw new Error(
        "GitHub authorization URL was not returned.",
      );
    }

    window.location.href = authorizationUrl;
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to connect GitHub.",
    );
  }
};

  useEffect(() => {
    const storedToken = getToken();

    queueMicrotask(() => {
      setToken(storedToken);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadGithubRepositories = async () => {
      try {
        setLoadingGithub(true);
        setError("");

        const response =
          await getAvailableRepositories(token);

        setGithubRepositories(
          response.data.repositories,
        );
      } catch {
        setError(
          "Failed to load GitHub repositories. Make sure your GitHub account is connected.",
        );
      } finally {
        setLoadingGithub(false);
      }
    };

    void loadGithubRepositories();
  }, [token]);

  const handleImport = async (
    owner: string,
    repo: string,
  ) => {
    if (!token) {
      return;
    }

    try {
      setImporting(`${owner}/${repo}`);
      setMessage("");
      setError("");

      await importRepository(owner, repo, token);

      setMessage(
        `${owner}/${repo} imported successfully.`,
      );

      setGithubRepositories((current) =>
        current.filter(
          (repository) =>
            !(
              repository.owner === owner &&
              repository.name === repo
            ),
        ),
      );
    } catch {
      setError(
        `Failed to import ${owner}/${repo}.`,
      );
    } finally {
      setImporting("");
    }
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold">
            Repositories
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold">
            Repositories
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Please sign in to view your repositories.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Repositories
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your imported GitHub repositories.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-900 bg-green-950/30 p-4 text-sm text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Import from GitHub
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose a repository from your connected GitHub account.
            </p>

            <button
              type="button"
              onClick={handleConnectGitHub}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Connect GitHub
            </button>
          </div>

          {loadingGithub ? (
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-8">
              <Loader2
                size={22}
                className="animate-spin text-blue-400"
              />

              <span className="ml-3 text-sm text-slate-400">
                Loading GitHub repositories...
              </span>
            </div>
          ) : githubRepositories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
              <GitBranch
                size={32}
                className="mx-auto mb-3 text-slate-600"
              />

              <p className="text-sm text-slate-400">
                No available GitHub repositories found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {githubRepositories.map((repository) => {
                const key = `${repository.owner}/${repository.name}`;
                const isImporting = importing === key;

                return (
                  <div
                    key={repository.githubRepoId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-white">
                        {repository.owner}/{repository.name}
                      </h3>

                      {repository.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {repository.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() =>
                        handleImport(
                          repository.owner,
                          repository.name,
                        )
                      }
                      className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isImporting
                        ? "Importing..."
                        : "Import"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Imported repositories
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Repositories already added to DevForge AI.
            </p>
          </div>

          <RepositoryList token={token} />
        </section>
      </div>
    </main>
  );
}