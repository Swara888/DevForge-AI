"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useParams } from "next/navigation";

import RepositoryDocumentation from "@/components/documentation/repository-documentation";
import { getToken } from "@/lib/auth";

export default function DocumentationPage() {
  const params = useParams<{ repositoryId: string }>();

  const repositoryId = params.repositoryId;
  const token = getToken();

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-400">
          Please sign in to continue.
        </p>
      </main>
    );
  }

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

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                Documentation
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Generate and explore technical documentation
                from the repository.
              </p>
            </div>
          </div>
        </div>

        <RepositoryDocumentation
          repositoryId={repositoryId}
          token={token}
        />
      </div>
    </main>
  );
}