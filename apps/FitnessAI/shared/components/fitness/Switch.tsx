import { GRAD } from "../../styles/design";

export function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="relative w-12 h-6 rounded-full transition-all flex items-center px-1"
      style={{ background: on ? GRAD : "rgba(255,255,255,0.12)", boxShadow: on ? "0 2px 12px rgba(0,102,255,0.4)" : "none" }}>
      <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ transform: on ? "translateX(24px)" : "translateX(0)" }} />
    </button>
  );
}
