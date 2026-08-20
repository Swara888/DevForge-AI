"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import CodeReviewPanel from "@/components/review/code-review-panel";
import { getToken } from "@/lib/auth";

export default function ReviewPage() {
  const params =
    useParams<{ repositoryId: string }>();

  const repositoryId = params.repositoryId;

  const [token, setToken] = useState<string | null>(
    null
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      setToken(getToken());
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <p className="text-slate-400">
          Loading...
        </p>
      </main>
    );
  }

  if (!repositoryId) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <p className="text-red-400">
          Repository ID is missing.
        </p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <p className="text-red-400">
          Authentication required. Please log in again.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">
            AI Code Review
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analyze your repository for bugs,
            security issues, and code quality problems.
          </p>
        </div>

        <CodeReviewPanel
          repositoryId={repositoryId}
          token={token}
        />
      </div>
    </main>
  );
}