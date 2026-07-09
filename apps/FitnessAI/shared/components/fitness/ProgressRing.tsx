export function ProgressRing({ progress, size = 120, sw = 10, color = "#0066FF", bg = "rgba(255,255,255,0.07)", children }: {
  /** Omit or pass undefined when progress is unknown — ring shows track only (unknown ≠ 0%). */
  progress?: number; size?: number; sw?: number; color?: string; bg?: string; children?: React.ReactNode;
}) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = progress !== undefined ? circ * Math.min(progress, 100) / 100 : 0;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={sw} />
        {progress !== undefined ? (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}90)`, transition: "stroke-dasharray 0.6s ease" }}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
