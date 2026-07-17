import type { FutureModule } from "../data/roadmap";
import { ModuleDetailsPanel } from "./ModuleDetailsPanel";
import { StatusBadge } from "./StatusBadge";

type FutureModuleCardProps = {
  module: FutureModule;
  expanded: boolean;
  onToggle: (moduleId: string) => void;
};

export function FutureModuleCard({
  module,
  expanded,
  onToggle,
}: FutureModuleCardProps) {
  const Icon = module.icon;

  return (
    <article
      className={[
        "rounded-card border transition-shadow",
        expanded
          ? "border-navy/25 bg-white ring-2 ring-navy/15"
          : "border-slate-line/80 bg-[#F7F8FC] hover:bg-white hover:shadow-card",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle(module.id)}
        aria-expanded={expanded}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-slate-body ring-1 ring-slate-line">
            <Icon size={16} strokeWidth={1.85} />
          </div>
          <StatusBadge variant="PLANNED" />
        </div>
        <h3 className="mt-3 text-[14px] font-semibold text-navy-ink">
          {module.name}
        </h3>
        <p className="mt-1 text-[12px] text-slate-body">{module.description}</p>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-label">ETA</span>
          <span className="font-stat font-medium text-navy-ink">{module.eta}</span>
        </div>
      </button>

      {expanded ? <ModuleDetailsPanel module={module} kind="future" /> : null}
    </article>
  );
}
