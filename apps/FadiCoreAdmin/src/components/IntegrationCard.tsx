import type { IntegrationApp } from "../data/appIntegrations";
import { toneIconBg } from "../data/appIntegrations";
import { StatusBadge } from "./StatusBadge";

type IntegrationCardProps = {
  app: IntegrationApp;
  selected?: boolean;
  onSelect: (appId: IntegrationApp["id"]) => void;
};

export function IntegrationCard({
  app,
  selected = false,
  onSelect,
}: IntegrationCardProps) {
  const Icon = app.icon;
  const degraded = app.health === "DEGRADED";

  return (
    <button
      type="button"
      onClick={() => onSelect(app.id)}
      aria-pressed={selected}
      className={[
        "rounded-card border bg-white p-5 text-left shadow-card transition-shadow",
        degraded ? "border-[#F0C57A]" : "border-slate-line/80",
        selected
          ? "ring-2 ring-navy/30 shadow-[0_0_0_1px_rgba(27,63,145,0.15)]"
          : "hover:shadow-[0_4px_16px_rgba(20,36,71,0.08)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${toneIconBg[app.tone]}`}
        >
          <Icon size={20} strokeWidth={1.85} />
        </div>
        <StatusBadge variant={app.health} withDot />
      </div>

      <h3 className="mt-4 text-[15px] font-semibold text-navy-ink">{app.name}</h3>

      <dl className="mt-4 space-y-2.5 text-[12.5px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-label">Last sync</dt>
          <dd className="font-stat text-navy-muted">{app.lastSync}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-label">Core signals in</dt>
          <dd className="font-stat text-navy">{app.signalsInPerHour}/hr</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-label">AI predictions out</dt>
          <dd className="font-stat text-accent-purple">
            {app.predictionsOutPerHour}/hr
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-label">Errors (24h)</dt>
          <dd
            className={[
              "font-stat",
              app.errors24h > 0 ? "text-[#C77700]" : "text-success-text",
            ].join(" ")}
          >
            {app.errors24h}
          </dd>
        </div>
      </dl>
    </button>
  );
}
