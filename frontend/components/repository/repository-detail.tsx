"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, GitBranch, Loader2 } from "lucide-react";

import GeneratedTestPanel from "@/components/testing/generated-test-panel";
import CodeReviewPanel from "@/components/review/code-review-panel";
import RepositoryDocumentation from "@/components/documentation/repository-documentation";
import RepositoryFileExplorer from "@/components/repository/repository-file-explorer";

import {
  getRepository,
  ingestRepository,
} from "@/lib/repository-api";
import { getToken } from "@/lib/auth";
import type { Repository } from "@/types/repository";

export default function RepositoryDetail() {
  const params = useParams<{ repositoryId: string }>();

  const repositoryId = params.repositoryId;
  const token = getToken();

  const [repository, setRepository] =
    useState<Repository | null>(null);

  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!repositoryId) {
      return;
    }

    localStorage.setItem(
      "devforge_selected_repository",
      repositoryId
    );

    window.dispatchEvent(
      new Event("devforge-repository-changed")
    );
  }, [repositoryId]);

  useEffect(() => {
    if (!repositoryId || !token) {
      return;
    }

    let cancelled = false;

    const loadRepository = async () => {
      try {
        const response = await getRepository(
          repositoryId,
          token
        );

        if (cancelled) {
          return;
        }

        setRepository(response.data.repository);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load repository:",
          err
        );

        setError("Failed to load repository.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRepository();

    return () => {
      cancelled = true;
    };
  }, [repositoryId, token]);

  const handleIngest = async () => {
    if (!token || !repository) {
      return;
    }

    try {
      setIngesting(true);
      setMessage("");
      setError("");

      const response = await ingestRepository(
        repository.id,
        token
      );

      setMessage(
        `Ingestion completed. ${response.data.importedFiles} files indexed.`
      );
    } catch (err) {
      console.error(
        "Failed to ingest repository:",
        err
      );

      setError("Failed to ingest repository.");
    } finally {
      setIngesting(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold">
            Repository
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Please sign in to continue.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-20">
          <Loader2
            className="animate-spin text-blue-400"
            size={28}
          />

          <span className="ml-3 text-slate-400">
            Loading repository...
          </span>
        </div>
      </main>
    );
  }

  if (error && !repository) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/repositories"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to repositories
          </Link>

          <p className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-red-400">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!repository) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/repositories"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to repositories
        </Link>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                <GitBranch size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold">
                  {repository.owner}/{repository.name}
                </h1>

                {repository.description && (
                  <p className="mt-2 text-sm text-slate-400">
                    {repository.description}
                  </p>
                )}
              </div>
            </div>

            <a
              href={repository.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              GitHub
            </a>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={handleIngest}
              disabled={ingesting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ingesting && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {ingesting
                ? "Indexing..."
                : "Index Repository"}
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <RepositoryFileExplorer
          repositoryId={repository.id}
          token={token}
        />


        <CodeReviewPanel
          repositoryId={repository.id}
          token={token}
        />

        <RepositoryDocumentation
          repositoryId={repository.id}
          token={token}
        />

        <GeneratedTestPanel
          repositoryId={repository.id}
        />
      </div>
    </main>
  );
}