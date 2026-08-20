"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import {
  generateRepositoryDocumentation,
} from "@/lib/documentation-api";

interface RepositoryDocumentationProps {
  repositoryId: string;
  token: string;
}

export default function RepositoryDocumentation({
  repositoryId,
  token,
}: RepositoryDocumentationProps) {
  const [documentation, setDocumentation] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await generateRepositoryDocumentation(
          repositoryId,
          token,
        );

      setDocumentation(
        response.data.documentation.content,
      );
    } catch (err) {
      console.error(
        "Failed to generate documentation:",
        err,
      );

      setError(
        "Failed to generate documentation. Make sure the repository is indexed first.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
              <FileText size={20} />
            </div>

            <h2 className="text-xl font-semibold">
              Documentation
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Generate technical documentation from the
            indexed repository.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {documentation && (
        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Generated Documentation
          </h3>

          <article className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
            {documentation}
          </article>
        </div>
      )}
    </section>
  );
}