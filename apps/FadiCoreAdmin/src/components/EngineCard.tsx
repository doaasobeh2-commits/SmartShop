import {
  confidenceBarTone,
  formatSignals,
  type IntelligenceEngine,
} from "../data/intelligenceEngines";
import { EngineDetailsPanel } from "./EngineDetailsPanel";

const barColors = {
  green: "bg-[#2F9E6B]",
  amber: "bg-[#E0A93B]",
  red: "bg-[#F07A7A]",
} as const;

const statusDot = {
  ACTIVE: "bg-success",
  DEGRADED: "bg-[#E89A2E]",
  WARNING: "bg-[#E89A2E]",
} as const;

type EngineCardProps = {
  engine: IntelligenceEngine;
  expanded: boolean;
  onToggle: (engineId: IntelligenceEngine["id"]) => void;
};

export function EngineCard({ engine, expanded, onToggle }: EngineCardProps) {
  const tone = confidenceBarTone(engine.confidence);

  return (
    <article
      className={[
        "rounded-card border bg-white shadow-card transition-shadow",
        expanded
          ? "border-navy/25 ring-2 ring-navy/15"
          : "border-slate-line/80 hover:shadow-[0_4px_16px_rgba(20,36,71,0.08)]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle(engine.id)}
        aria-expanded={expanded}
        className="w-full p-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${statusDot[engine.status]}`}
                aria-hidden
              />
              <h3 className="text-[15px] font-semibold text-navy-ink">
                {engine.name}
              </h3>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-body">
              {engine.description}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-stat text-[22px] font-medium leading-none tracking-[-0.03em] text-navy-ink">
              {engine.confidence}%
            </div>
            <div className="mt-1 text-[11px] text-slate-label">confidence</div>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEF1F6]">
          <div
            className={`h-full rounded-full ${barColors[tone]}`}
            style={{ width: `${engine.confidence}%` }}
            role="progressbar"
            aria-valuenow={engine.confidence}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${engine.name} confidence`}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-line/70 pt-3.5">
          <div>
            <div className="text-[11px] text-slate-label">Signals processed</div>
            <div className="mt-1 font-stat text-[13px] font-medium text-navy-ink">
              {formatSignals(engine.signalsProcessed)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-label">Last run</div>
            <div className="mt-1 font-stat text-[13px] font-medium text-navy-muted">
              {engine.lastRun}
            </div>
          </div>
        </div>
      </button>

      {expanded ? <EngineDetailsPanel engine={engine} /> : null}
    </article>
  );
}
