import { tasteIntelligenceTrends } from "../data/householdIntelligence";

export function TasteTrends() {
  return (
    <article className="flex h-full flex-col rounded-card border border-slate-line/80 bg-white p-5 shadow-card lg:p-6">
      <h2 className="mb-5 text-[15px] font-semibold text-navy-ink">
        Taste Intelligence Trends
      </h2>

      <ul className="flex flex-1 flex-col justify-between gap-4">
        {tasteIntelligenceTrends.map((trend) => (
          <li key={trend.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[12.5px] font-medium text-navy-muted">
                {trend.label}
              </span>
              <span className="font-stat text-[12px] text-slate-label">
                {trend.value}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F6]">
              <div
                className="h-full rounded-full bg-[#F07A7A]"
                style={{ width: `${trend.value}%` }}
                role="progressbar"
                aria-valuenow={trend.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={trend.label}
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
