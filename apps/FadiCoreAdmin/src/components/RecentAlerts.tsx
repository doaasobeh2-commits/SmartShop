import { recentAlerts } from "../data/platformOverview";

export function RecentAlerts() {
  return (
    <article className="flex h-full flex-col rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-4 text-[15px] font-semibold text-navy-ink">
        Recent Alerts
      </h2>

      <ul className="flex flex-1 flex-col gap-0">
        {recentAlerts.map((alert, index) => (
          <li
            key={alert.id}
            className={[
              "flex items-start gap-3 py-3.5",
              index < recentAlerts.length - 1 ? "border-b border-slate-line/70" : "",
            ].join(" ")}
          >
            <span
              className={[
                "mt-[6px] h-2 w-2 shrink-0 rounded-full",
                alert.tone === "warning" ? "bg-warning-icon" : "bg-[#4C7BD9]",
              ].join(" ")}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium leading-snug text-navy-muted">
                {alert.message}
              </p>
            </div>
            <span className="shrink-0 pt-0.5 font-stat text-[11px] text-slate-label">
              {alert.time}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
