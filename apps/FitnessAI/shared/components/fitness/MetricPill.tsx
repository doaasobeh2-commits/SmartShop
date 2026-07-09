export function MetricPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl flex-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ color }}>{icon}</div>
      <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>{value}</span>
      <span className="text-white/40 text-xs font-medium">{label}</span>
    </div>
  );
}
