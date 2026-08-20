"use client";

import {
  Code2,
  FileText,
  GitBranch,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
};

export default function Sidebar() {
  const pathname = usePathname();

  const [repositoryId, setRepositoryId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const updateRepository = () => {
      const savedRepository = localStorage.getItem(
        "devforge_selected_repository"
      );

      setRepositoryId(savedRepository);
    };

    updateRepository();

    window.addEventListener(
      "devforge-repository-changed",
      updateRepository
    );

    return () => {
      window.removeEventListener(
        "devforge-repository-changed",
        updateRepository
      );
    };
  }, []);

  const repositoryMatch = pathname.match(
    /^\/repositories\/([^/]+)/
  );

  const chatMatch = pathname.match(/^\/chat\/([^/]+)/);

  const reviewMatch = pathname.match(/^\/review\/([^/]+)/);

  const documentationMatch = pathname.match(
    /^\/documentation\/([^/]+)/
  );

  const testsMatch = pathname.match(/^\/tests\/([^/]+)/);

  const currentRepositoryId =
    repositoryMatch?.[1] ??
    chatMatch?.[1] ??
    reviewMatch?.[1] ??
    documentationMatch?.[1] ??
    testsMatch?.[1] ??
    repositoryId;

  const navigationItems: NavigationItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Repositories",
      href: "/repositories",
      icon: GitBranch,
    },
    {
      label: "Code Chat",
      href: currentRepositoryId
        ? `/chat/${currentRepositoryId}`
        : "/repositories",
      icon: Code2,
    },
    {
      label: "Code Review",
      href: currentRepositoryId
        ? `/review/${currentRepositoryId}`
        : "/repositories",
      icon: ShieldCheck,
    },
    {
      label: "Documentation",
      href: currentRepositoryId
        ? `/documentation/${currentRepositoryId}`
        : "/repositories",
      icon: FileText,
    },
    {
      label: "Tests",
      href: currentRepositoryId
        ? `/tests/${currentRepositoryId}`
        : "/repositories",
      icon: FlaskConical,
    },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-950">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Code2 size={20} />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-white">
              DevForge AI
            </h1>

            <p className="text-xs text-slate-500">
              AI Code Intelligence
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Workspace
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}