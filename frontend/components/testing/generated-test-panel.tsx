"use client";

import { useState } from "react";
import { Loader2, TestTube } from "lucide-react";

import { getToken } from "@/lib/auth";
import { generateRepositoryTest } from "@/lib/test-api";

interface GeneratedTestPanelProps {
  repositoryId: string;
}

export default function GeneratedTestPanel({
  repositoryId,
}: GeneratedTestPanelProps) {
  const [testCode, setTestCode] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
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

      const response = await generateRepositoryTest(
        repositoryId,
        token,
      );

      setTestCode(response.data.testCode);
      setFilePath(response.data.filePath);
    } catch (err) {
      console.error("Failed to generate tests:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate tests.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-3">
        <TestTube
          size={24}
          className="text-purple-400"
        />

        <div>
          <h2 className="text-lg font-semibold text-white">
            Generate Tests
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Generate automated tests from the indexed repository code.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && (
          <Loader2
            size={16}
            className="animate-spin"
          />
        )}

        {loading ? "Generating..." : "Generate Tests"}
      </button>

      {error && (
        <p className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {testCode && (
        <div className="mt-6">
          {filePath && (
            <p className="mb-3 text-sm text-slate-400">
              Based on:{" "}
              <span className="text-slate-200">
                {filePath}
              </span>
            </p>
          )}

          <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-5 text-sm leading-6 text-slate-300">
            <code>{testCode}</code>
          </pre>
        </div>
      )}
    </section>
  );
}