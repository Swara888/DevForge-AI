"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

import { getToken } from "@/lib/auth";
import { generateRepositoryDocumentation } from "@/lib/documentation-api";

export default function DocumentationPage() {
  const params = useParams<{ repositoryId: string }>();
  const repositoryId = params.repositoryId;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    const token = getToken();

    if (!token) {
      setError("Please sign in first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await generateRepositoryDocumentation(
          repositoryId,
          token,
        );

      setContent(response.data.documentation.content);
    } catch (err) {
      console.error(
        "Failed to generate documentation:",
        err,
      );

      setError("Failed to generate documentation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/repositories/${repositoryId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to repository
        </Link>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-3">
            <FileText
              size={24}
              className="text-blue-400"
            />

            <div>
              <h1 className="text-2xl font-semibold">
                Repository Documentation
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Generate technical documentation from the
                indexed repository.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {loading
              ? "Generating..."
              : "Generate Documentation"}
          </button>

          {error && (
            <p className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {content && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-lg font-semibold">
              Generated Documentation
            </h2>

            <article className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {content}
            </article>
          </div>
        )}
      </div>
    </main>
  );
}