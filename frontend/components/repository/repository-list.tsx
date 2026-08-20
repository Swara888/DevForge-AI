"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, GitBranch, Loader2 } from "lucide-react";

import { getRepositories } from "@/lib/repository-api";
import type { Repository } from "@/types/repository";

type RepositoryListProps = {
  token: string;
};

export default function RepositoryList({
  token,
}: RepositoryListProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getRepositories(token);

        setRepositories(response.data.repositories);
      } catch {
        setError("Failed to load repositories.");
      } finally {
        setLoading(false);
      }
    };

    void loadRepositories();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-10">
        <Loader2 className="animate-spin text-blue-400" size={24} />
        <span className="ml-3 text-sm text-slate-400">
          Loading repositories...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
        <GitBranch
          size={40}
          className="mx-auto mb-4 text-slate-600"
        />

        <h2 className="text-lg font-semibold text-white">
          No repositories imported
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Import a GitHub repository to start analyzing your codebase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories.map((repository) => (
        <div
          key={repository.id}
          className="rounded-xl border border-slate-800 bg-slate-900 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                <GitBranch size={20} />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-white">
                  {repository.owner}/{repository.name}
                </h3>

                {repository.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {repository.description}
                  </p>
                )}
              </div>
            </div>

            <a
              href={repository.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-slate-500 hover:text-white"
            >
              <ExternalLink size={18} />
            </a>
          </div>

          <div className="mt-5">
            <Link
              href={`/repositories/${repository.id}`}
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Open repository
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}