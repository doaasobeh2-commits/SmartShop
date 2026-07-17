import { ArrowRight } from "lucide-react";
import {
  integrationApps,
  toneBorder,
  type IntegrationApp,
} from "../data/appIntegrations";

function FlowAppNode({ app }: { app: IntegrationApp }) {
  const Icon = app.icon;
  return (
    <div
      className={`flex items-center gap-2.5 rounded-[10px] border bg-white px-3 py-2.5 ${toneBorder[app.tone]}`}
    >
      <Icon size={15} strokeWidth={1.85} />
      <span className="text-[12.5px] font-medium text-navy-ink">{app.name}</span>
    </div>
  );
}

function FlowArrow({ direction = "in" }: { direction?: "in" | "out" }) {
  return (
    <div
      className={[
        "hidden items-center justify-center text-slate-icon sm:flex",
        direction === "out" ? "text-accent-purple" : "text-[#7BA0D8]",
      ].join(" ")}
      aria-hidden
    >
      <ArrowRight size={18} strokeWidth={1.75} />
    </div>
  );
}

export function SignalFlowArchitecture() {
  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="text-[15px] font-semibold text-navy-ink">
        Signal Flow Architecture
      </h2>

      <div className="mt-6 grid grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(180px,220px)_auto_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          {integrationApps.map((app) => (
            <div key={`in-${app.id}`} className="flex items-center gap-3">
              <FlowAppNode app={app} />
              <FlowArrow direction="in" />
            </div>
          ))}
        </div>

        <div className="hidden lg:block" />

        <div className="mx-auto flex w-full max-w-[220px] flex-col items-center justify-center rounded-card bg-navy px-6 py-8 text-center text-white shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Core
          </div>
          <div className="mt-2 text-[15px] font-semibold leading-snug">
            Fadi Core
            <br />
            Platform
          </div>
        </div>

        <div className="hidden lg:block" />

        <div className="flex flex-col gap-3">
          {integrationApps.map((app) => (
            <div
              key={`out-${app.id}`}
              className="flex items-center justify-end gap-3"
            >
              <FlowArrow direction="out" />
              <FlowAppNode app={app} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile stacked flow */}
      <div className="mt-4 flex flex-col items-center gap-2 lg:hidden">
        <div className="text-[11px] text-slate-label">Signals in → Core → projections out</div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-slate-line pt-4 text-[12px]">
        <div className="flex items-center gap-2 text-[#5B7FBE]">
          <span className="h-0.5 w-6 rounded bg-[#7BA0D8]" />
          Signal ingestion → Core
        </div>
        <div className="flex items-center gap-2 text-accent-purple">
          <span className="h-0.5 w-6 rounded bg-accent-purple/70" />
          Intelligence projections ← Core
        </div>
      </div>
    </article>
  );
}
