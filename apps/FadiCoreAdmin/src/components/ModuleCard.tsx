import { AlertTriangle, Check } from "lucide-react";
import { moduleIconBg, type ActiveModule } from "../data/roadmap";
import { ModuleDetailsPanel } from "./ModuleDetailsPanel";
import { StatusBadge } from "./StatusBadge";

type ModuleCardProps = {
  module: ActiveModule;
  expanded: boolean;
  onToggle: (moduleId: string) => void;
};

export function ModuleCard({ module, expanded, onToggle }: ModuleCardProps) {
  const Icon = module.icon;

  return (
    <article
      className={[
        "flex h-full flex-col rounded-card border bg-white shadow-card transition-shadow",
        expanded
          ? "border-navy/25 ring-2 ring-navy/15"
          : "border-slate-line/80 hover:shadow-[0_4px_16px_rgba(20,36,71,0.08)]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle(module.id)}
        aria-expanded={expanded}
        className="flex flex-1 flex-col p-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${moduleIconBg[module.tone]}`}
          >
            <Icon size={20} strokeWidth={1.85} />
          </div>
          <StatusBadge variant={module.status} withDot />
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-navy-ink">
            {module.name}
          </h3>
          <span className="font-stat text-[12px] text-slate-label">
            {module.version}
          </span>
        </div>

        <p className="mt-2 text-[12.5px] leading-relaxed text-slate-body">
          {module.description}
        </p>

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-label">
            Features
          </div>
          <ul className="space-y-1.5">
            {module.features.map((feature) => (
              <li
                key={feature.label}
                className="flex items-start gap-2 text-[12.5px] text-navy-muted"
              >
                {feature.tone === "ok" ? (
                  <Check
                    className="mt-0.5 shrink-0 text-success"
                    size={14}
                    strokeWidth={2.5}
                  />
                ) : (
                  <AlertTriangle
                    className="mt-0.5 shrink-0 text-[#C77700]"
                    size={14}
                    strokeWidth={2}
                  />
                )}
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-line pt-3.5 mt-5 text-[12px]">
          <span className="text-slate-label">{module.launchLabel}</span>
          <span className="font-stat font-medium text-navy-ink">
            {module.launchQuarter}
          </span>
        </div>
      </button>

      {expanded ? <ModuleDetailsPanel module={module} kind="active" /> : null}
    </article>
  );
}
