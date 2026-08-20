
import {
  Code2,
  FileText,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
};

const actions: QuickAction[] = [
  {
    title: "Import Repository",
    description: "Connect a GitHub repository",
    href: "/repositories",
    icon: GitBranch,
  },
  {
    title: "Ask Your Code",
    description: "Chat with your codebase",
    href: "/repositories",
    icon: Code2,
  },
  {
    title: "Review Code",
    description: "Analyze code quality",
    href: "/repositories",
    icon: ShieldCheck,
  },
  {
    title: "Generate Docs",
    description: "Create technical documentation",
    href: "/repositories",
    icon: FileText,
  },
];

export default function QuickActions() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Quick actions
        </h2>

        <p className="text-sm text-slate-500">
          Start working with your codebase
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                <Icon size={20} />
              </div>

              <h3 className="font-medium text-white">
                {action.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

