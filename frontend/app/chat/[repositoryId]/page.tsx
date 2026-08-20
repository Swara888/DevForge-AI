"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";

import RepositoryChat from "@/components/chat/repository-chat";
import { getToken } from "@/lib/auth";

export default function RepositoryChatPage() {
  const params = useParams<{ repositoryId: string }>();
  const repositoryId = params.repositoryId;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  const token = getToken();

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-400">
            Please sign in to continue.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl">
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
              <MessageSquare size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                Repository Chat
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Chat with your indexed codebase using DevForge AI.
              </p>
            </div>
          </div>
        </div>

        <RepositoryChat
          repositoryId={repositoryId}
          token={token}
        />
      </div>
    </main>
  );
}