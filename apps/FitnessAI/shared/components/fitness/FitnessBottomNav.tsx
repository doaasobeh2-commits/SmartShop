import type { MainTab, Lang } from "@fitness-ai/core/types";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GRAD_SOFT } from "@fitness-ai/shared/styles/design";
import { Dumbbell, Sparkles, User, Utensils, Sun } from "lucide-react";

export type FitnessBottomNavProps = {
  tab: MainTab;
  onTabChange: (tab: MainTab) => void;
  lang: Lang;
};

export function FitnessBottomNav({ tab, onTabChange, lang }: FitnessBottomNavProps) {
  const t = T[lang];
  const items: { id: MainTab; icon: React.ReactNode; label: string }[] = [
    { id: "today", icon: <Sun size={22} />, label: t.today },
    { id: "nutrition", icon: <Utensils size={22} />, label: t.nutrition },
    { id: "workout", icon: <Dumbbell size={22} />, label: t.workout },
    { id: "coach", icon: <Sparkles size={22} />, label: t.coach },
    { id: "profile", icon: <User size={22} />, label: t.profile },
  ];

  return (
    <div className="w-full px-4 pb-6 pt-2" style={{ background: "linear-gradient(to top, #050A14 60%, transparent)" }}>
      <div
        className="flex justify-around items-center px-2 py-3 rounded-3xl"
        style={{
          background: "rgba(10,22,40,0.95)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
        }}
      >
        {items.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all active:scale-90"
              style={active ? { background: GRAD_SOFT } : {}}
            >
              <div
                style={{
                  color: active ? "#06B6D4" : "rgba(255,255,255,0.35)",
                  filter: active ? "drop-shadow(0 0 8px #06B6D450)" : "none",
                }}
              >
                {item.icon}
              </div>
              <span
                className="text-xs font-semibold"
                style={{
                  color: active ? "#06B6D4" : "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
