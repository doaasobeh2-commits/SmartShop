import type { KpiStat } from "../data/platformOverview";

const toneStyles = {
  blue: {
    wrap: "bg-accent-blueSoft text-navy",
  },
  purple: {
    wrap: "bg-accent-purpleSoft text-accent-purple",
  },
  green: {
    wrap: "bg-accent-greenSoft text-success",
  },
  yellow: {
    wrap: "bg-accent-yellowSoft text-warning-icon",
  },
} as const;

const footerStyles = {
  green: "text-success-text",
  purple: "text-accent-purple",
  muted: "text-slate-label",
} as const;

type KpiStatCardProps = {
  stat: KpiStat;
};

export function KpiStatCard({ stat }: KpiStatCardProps) {
  const Icon = stat.icon;
  const tone = toneStyles[stat.tone];
  const footerTone = footerStyles[stat.footerTone ?? "muted"];

  return (
    <article className="rounded-card border border-slate-line/80 bg-white p-5 shadow-card">
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-[10px] ${tone.wrap}`}
      >
        <Icon size={17} strokeWidth={1.85} />
      </div>
      <div className="font-stat text-[28px] font-medium leading-none tracking-[-0.03em] text-navy-ink">
        {stat.value}
      </div>
      <div className="mt-2 text-[13px] font-medium text-slate-body">
        {stat.label}
      </div>
      {stat.footer ? (
        <div className={`mt-3 text-[12px] ${footerTone}`}>{stat.footer}</div>
      ) : null}
    </article>
  );
}
