export function Tag({ children, color = "#0066FF" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {children}
    </span>
  );
}
