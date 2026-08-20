import { GitBranch } from "lucide-react";
import Link from "next/link";

import type {
  DashboardRepository,
} from "@/lib/dashboard-api";

type RecentRepositoriesProps = {
  repositories: DashboardRepository[];
};

export default function RecentRepositories({
  repositories,
}: RecentRepositoriesProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Recent repositories
          </h2>

          <p className="text-sm text-slate-500">
            Your recently imported codebases
          </p>
        </div>

        <Link
          href="/repositories"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          View all
        </Link>
      </div>

      {repositories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-500">
            <GitBranch size={22} />
          </div>

          <h3 className="font-medium text-white">
            No repositories yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Import a GitHub repository to start analyzing
            your codebase with DevForge AI.
          </p>

          <Link
            href="/repositories"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Import repository
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {repositories.map((repository) => (
            <Link
              key={repository.id}
              href={`/repositories/${repository.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                  <GitBranch size={20} />
                </div>

                <div>
                  <p className="font-medium text-white">
                    {repository.owner}/{repository.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {repository.status}
                  </p>
                </div>
              </div>

              <span className="text-sm text-slate-500">
                Open →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}