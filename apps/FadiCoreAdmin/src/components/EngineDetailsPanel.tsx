import {
  statusToBadge,
  type IntelligenceEngine,
} from "../data/intelligenceEngines";
import { StatusBadge } from "./StatusBadge";

type EngineDetailsPanelProps = {
  engine: IntelligenceEngine;
};

export function EngineDetailsPanel({ engine }: EngineDetailsPanelProps) {
  const { details } = engine;

  return (
    <div className="border-t border-slate-line bg-[#F8FAFD] px-5 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-[13px] font-semibold text-navy-ink">
          Engine details
        </h4>
        <StatusBadge variant={statusToBadge(engine.status)} withDot />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailBlock title="Input sources" items={details.inputSources} />
        <DetailBlock title="Output targets" items={details.outputTargets} />
        <DetailBlock title="Decision rules" items={details.decisionRules} />

        <div className="space-y-3 rounded-[10px] border border-slate-line/80 bg-white p-3.5">
          <MetaRow label="Confidence trend" value={details.confidenceTrend} />
          <MetaRow
            label="Reinforcement status"
            value={details.reinforcementStatus}
          />
          <MetaRow label="Last update" value={details.lastUpdate} mono />
          <MetaRow
            label="Processing queue"
            value={`${details.processingQueue} jobs`}
            mono
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-label">
          Recent warnings
        </div>
        {details.recentWarnings.length === 0 ? (
          <p className="rounded-[10px] border border-slate-line/80 bg-white px-3.5 py-3 text-[12.5px] text-slate-body">
            No recent warnings.
          </p>
        ) : (
          <ul className="space-y-2">
            {details.recentWarnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2 rounded-[10px] border border-[#F0C57A]/70 bg-[#FFF8EC] px-3.5 py-2.5 text-[12.5px] text-[#8A5A10]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E89A2E]" />
                {warning}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[10px] border border-slate-line/80 bg-white p-3.5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-label">
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[12.5px] leading-snug text-navy-muted"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-icon" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-slate-label">{label}</span>
      <span
        className={[
          "max-w-[65%] text-right text-[12.5px] text-navy-ink",
          mono ? "font-stat" : "font-medium",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
