"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import RepositoryChat from "@/components/chat/repository-chat";
import { getToken } from "@/lib/auth";

export default function ChatPage() {
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
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  const token = getToken();

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-400">
            Please sign in to continue.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/repositories/${repositoryId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to repository
        </Link>

        <RepositoryChat
          repositoryId={repositoryId}
          token={token}
        />
      </div>
    </main>
  );
}