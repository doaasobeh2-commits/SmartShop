export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      {action && <button onClick={onAction} className="text-sm font-semibold" style={{ color: "#06B6D4" }}>{action}</button>}
    </div>
  );
}
