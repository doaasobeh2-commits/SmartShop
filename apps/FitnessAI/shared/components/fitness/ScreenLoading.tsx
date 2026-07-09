import type { Lang } from "@fitness-ai/core/types";
import { T } from "../../i18n/translations";

export function ScreenLoading({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-4 px-5 pt-8" role="status" aria-live="polite">
      <p className="text-sm text-white/40">{T[lang].loading}</p>
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-3xl"
            style={{ background: "rgba(255,255,255,0.05)", animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
