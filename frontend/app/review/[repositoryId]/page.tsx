"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ReviewPage from "@/components/review/[repositoryId]/page";

export default function ReviewRoute() {
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
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  return <ReviewPage />;
}