import { ChevronLeft } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { T } from "../../i18n/translations";
import { GLASS } from "../../styles/design";

export type BackHeaderProps = {
  lang: Lang;
  onBack: () => void;
  title?: string;
  className?: string;
};

export function BackHeader({ lang, onBack, title, className = "" }: BackHeaderProps) {
  const backLabel = T[lang].back;

  return (
    <header className={`flex items-center gap-3 px-5 pb-4 pt-2 ${className}`}>
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-opacity active:scale-95"
        style={GLASS}
      >
        <ChevronLeft size={20} className="text-white/80" aria-hidden />
      </button>
      {title ? (
        <h1 className="text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
      ) : null}
    </header>
  );
}
