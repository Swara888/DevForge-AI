import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-blue-600/10 p-2.5 text-blue-400">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}