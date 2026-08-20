"use client";

import { FormEvent, useState } from "react";

import { askRepositoryQuestion } from "../../lib/rag-api";
import type { AskRepositoryResponse } from "../../types/rag";

interface RepositoryQAProps {
  repositoryId: string;
  token: string;
}

export default function RepositoryQA({
  repositoryId,
  token,
}: RepositoryQAProps) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] =
    useState<AskRepositoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await askRepositoryQuestion(
        repositoryId,
        cleanQuestion,
        token,
      );

      setResponse(result);
    } catch {
      setError(
        "Failed to get an answer from the repository.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-4xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Ask Your Repository
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Ask questions about the codebase and get answers
          based on retrieved repository code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Where are complaints created?"
          rows={4}
          disabled={loading}
          className="w-full resize-none rounded-lg border border-zinc-300 p-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:bg-zinc-100"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Ask Repository"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-900">
              Answer
            </h3>

            <div className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
              {response.data.answer}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">
              Sources
            </h3>

            <div className="space-y-3">
              {response.data.sources.map((source) => (
                <div
                  key={source.chunkId}
                  className="rounded-lg border border-zinc-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-zinc-900">
                      {source.filePath}
                    </span>

                    <span className="text-xs text-zinc-500">
                      Lines {source.startLine}-
                      {source.endLine}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-zinc-500">
                    Similarity:{" "}
                    {source.similarity.toFixed(4)}
                  </div>

                  <pre className="mt-3 overflow-x-auto rounded-md bg-zinc-950 p-4 text-xs leading-5 text-zinc-100">
                    <code>{source.content}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}