import type { AppStatus } from "../data/platformOverview";
import { StatusBadge } from "./StatusBadge";

const toneStyles = {
  blue: "bg-accent-blueSoft text-navy",
  green: "bg-accent-greenSoft text-success",
  purple: "bg-accent-purpleSoft text-accent-purple",
} as const;

type AppStatusCardProps = {
  app: AppStatus;
};

export function AppStatusCard({ app }: AppStatusCardProps) {
  const Icon = app.icon;

  return (
    <article className="flex flex-col rounded-card border border-slate-line/80 bg-white shadow-card">
      <div className="flex items-start gap-3.5 px-5 pb-4 pt-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${toneStyles[app.tone]}`}
        >
          <Icon size={20} strokeWidth={1.85} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-navy-ink">
              {app.name}
            </h3>
            <StatusBadge variant={app.badge} />
          </div>
          <p className="mt-1 text-[12.5px] leading-snug text-slate-body">
            {app.description}
          </p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 border-t border-slate-line">
        <StatCell value={app.signalsPerHour} label="Signals/hr" />
        <StatCell
          value={app.lastSync}
          label="Last sync"
          className="border-x border-slate-line"
        />
        <StatCell value={app.households} label="Households" />
      </div>
    </article>
  );
}

function StatCell({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`px-3 py-3.5 text-center ${className}`}>
      <div className="font-stat text-[14px] font-medium text-navy-ink">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-slate-label">{label}</div>
    </div>
  );
}
