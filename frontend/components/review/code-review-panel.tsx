"use client";

import { useState } from "react";

interface CodeReviewPanelProps {
  repositoryId: string;
  token: string;
}

interface ReviewFinding {
  id?: string;
  severity?: string;
  title?: string;
  description?: string;
  filePath?: string;
  startLine?: number | null;
  endLine?: number | null;
  suggestion?: string;
}

interface ReviewResponse {
  success: boolean;
  data?: {
    review?: {
      id: string;
      repositoryId: string;
      status?: string;
      summary?: string;
      findings?: ReviewFinding[];
    };
    findings?: ReviewFinding[];
  };
  error?: {
    message?: string;
  };
}

export default function CodeReviewPanel({
  repositoryId,
  token,
}: CodeReviewPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<ReviewResponse["data"] | null>(null);

  const runReview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/v1/review/repositories/${repositoryId}/review`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scope: "repository",
          }),
        },
      );

      const data: ReviewResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message || "Failed to generate code review",
        );
      }

      setReview(data.data ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the review.",
      );
    } finally {
      setLoading(false);
    }
  };

  const findings =
    review?.review?.findings ??
    review?.findings ??
    [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Code Review</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Analyze this repository for bugs, security issues, and code
              quality problems.
            </p>
          </div>

          <button
            onClick={runReview}
            disabled={loading}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Reviewing..." : "Run Code Review"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Review Result */}
      {review?.review && (
        <div className="space-y-6">
          {/* Summary */}
          {review.review.summary && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Summary</h2>

              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {review.review.summary}
              </p>
            </div>
          )}

          {/* Findings */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Findings</h2>

              <span className="text-sm text-muted-foreground">
                {findings.length} finding
                {findings.length === 1 ? "" : "s"}
              </span>
            </div>

            {findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No issues were found.
              </p>
            ) : (
              <div className="space-y-4">
                {findings.map((finding, index) => (
                  <div
                    key={
                      finding.id ||
                      `${finding.filePath ?? "unknown"}-${
                        finding.startLine ?? "unknown"
                      }-${finding.title ?? "issue"}-${index}`
                    }
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">
                        {finding.title || "Code issue"}
                      </h3>

                      {finding.severity && (
                        <span className="rounded-full border px-2 py-1 text-xs">
                          {finding.severity}
                        </span>
                      )}
                    </div>

                    {/* File location */}
                    {finding.filePath && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {finding.filePath}

                        {finding.startLine != null &&
                          `:${finding.startLine}`}

                        {finding.endLine != null &&
                          finding.endLine !== finding.startLine &&
                          `-${finding.endLine}`}
                      </p>
                    )}

                    {/* Description */}
                    {finding.description && (
                      <p className="mt-3 whitespace-pre-wrap text-sm">
                        {finding.description}
                      </p>
                    )}

                    {/* Suggestion */}
                    {finding.suggestion && (
                      <div className="mt-4 rounded-md bg-muted p-3">
                        <p className="mb-1 text-xs font-semibold">
                          Suggestion
                        </p>

                        <p className="whitespace-pre-wrap text-sm">
                          {finding.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}