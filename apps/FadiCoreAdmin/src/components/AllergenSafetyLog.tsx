import { TriangleAlert } from "lucide-react";
import type { AllergenAlert, AllergenSeverity } from "../data/safetyPrivacy";
import { StatusBadge } from "./StatusBadge";

const severityVariant: Record<
  AllergenSeverity,
  "CRITICAL" | "WARNING" | "NORMAL"
> = {
  Critical: "CRITICAL",
  Warning: "WARNING",
  Normal: "NORMAL",
};

type AllergenSafetyLogProps = {
  alerts: AllergenAlert[];
  expandedId: string | null;
  onToggle: (alertId: string) => void;
};

export function AllergenSafetyLog({
  alerts,
  expandedId,
  onToggle,
}: AllergenSafetyLogProps) {
  return (
    <article className="flex h-full flex-col rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-navy-ink">
        Allergen Safety Log
      </h2>

      {alerts.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-slate-label">
          No allergen alerts match the current search.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col">
          {alerts.map((alert) => {
            const expanded = expandedId === alert.id;
            return (
              <li
                key={alert.id}
                className="border-b border-slate-line/70 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onToggle(alert.id)}
                  aria-expanded={expanded}
                  className={[
                    "flex w-full items-start gap-3 px-1 py-3.5 text-left transition-colors",
                    expanded ? "bg-[#F5F7FC]" : "hover:bg-[#F8FAFD]",
                  ].join(" ")}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FDE8E8] text-[#C0392B]">
                    <TriangleAlert size={14} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-stat text-[12.5px] font-medium text-navy-ink">
                        {alert.householdId}
                      </span>
                      <span className="text-[12.5px] font-semibold text-[#C0392B]">
                        {alert.allergen}
                      </span>
                      <StatusBadge
                        variant={severityVariant[alert.severity]}
                        label={alert.severity}
                      />
                    </div>
                    <p className="mt-1 text-[12px] text-slate-body">
                      Source: {alert.sourceApp} → Propagated:{" "}
                      {alert.propagatedTo.join(", ")}
                    </p>
                  </div>
                  <span className="shrink-0 font-stat text-[11px] text-slate-label">
                    {alert.time}
                  </span>
                </button>

                {expanded ? (
                  <div className="border-t border-slate-line bg-[#F8FAFD] px-3 py-3.5">
                    <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-label">
                      Propagation history
                    </div>
                    <ul className="space-y-1.5">
                      {alert.propagationHistory.map((step) => (
                        <li
                          key={step}
                          className="flex items-start gap-2 text-[12.5px] text-navy-muted"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C0392B]" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
