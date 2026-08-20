"use client";

import {
  FileCode2,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";

import Sidebar from "./sidebar";
import StatCard from "./stat-card";
import QuickActions from "./quick-actions";
import RecentRepositories from "./recent-repositories";

import {
  getDashboardStats,
  type DashboardStats,
} from "@/lib/dashboard-api";

import { getToken } from "@/lib/auth";

export default function DashboardShell() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const token = getToken();

      if (!token) {
        setError("Please sign in to continue.");
        setLoading(false);
        return;
      }

      try {
        const response =
          await getDashboardStats(token);

        setStats(response.data);
      } catch (err) {
        console.error(
          "Failed to load dashboard:",
          err,
        );

        setError(
          "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b border-slate-800 bg-slate-950/80">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h2 className="font-semibold text-white">
                Dashboard
              </h2>
            </div>

            <div className="text-sm text-slate-500">
              AI Code Intelligence
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-8">
          <section>
            <h1 className="text-2xl font-semibold text-white">
              Welcome to DevForge AI
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Understand, analyze, and improve your
              codebase with AI.
            </p>
          </section>

          {error && (
            <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 py-16">
              <Loader2
                size={24}
                className="animate-spin text-blue-400"
              />

              <span className="ml-3 text-sm text-slate-400">
                Loading dashboard...
              </span>
            </div>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Repositories"
                  value={stats?.repositories ?? 0}
                  description="Imported repositories"
                  icon={GitBranch}
                />

                <StatCard
                  title="Code Files"
                  value={stats?.codeFiles ?? 0}
                  description="Indexed source files"
                  icon={FileCode2}
                />

                <StatCard
                  title="AI Questions"
                  value={stats?.aiQuestions ?? 0}
                  description="Questions asked"
                  icon={MessageSquare}
                />

                <StatCard
                  title="Code Reviews"
                  value={stats?.codeReviews ?? 0}
                  description="Reviews completed"
                  icon={ShieldCheck}
                />
              </section>

              <QuickActions />

              <RecentRepositories
                repositories={
                  stats?.recentRepositories ?? []
                }
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}