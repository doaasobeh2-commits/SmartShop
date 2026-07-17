import type { InferenceLogEntry } from "../data/signalsLogs";
import { StatusBadge } from "./StatusBadge";

type InferenceLogPanelProps = {
  entries: InferenceLogEntry[];
};

export function InferenceLogPanel({ entries }: InferenceLogPanelProps) {
  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-navy-ink">
        Inference Log — Engine Outputs
      </h2>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-slate-label">
          No inference log entries match the current search.
        </p>
      ) : (
        <ul className="space-y-0 overflow-x-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-start gap-x-3 gap-y-2 border-b border-slate-line/60 py-2.5 font-stat text-[12px] last:border-b-0"
            >
              <span className="shrink-0 text-slate-label">{entry.timestamp}</span>
              <StatusBadge variant={entry.severity} />
              <span className="shrink-0 text-accent-purple">
                [{entry.engine}]
              </span>
              <span className="shrink-0 rounded bg-canvas px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-slate-body">
                {entry.inferenceType}
              </span>
              <span className="min-w-[200px] flex-1 text-navy-muted">
                {entry.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
