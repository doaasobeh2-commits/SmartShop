import type { ReactNode } from "react";
import type { Lang } from "@fitness-ai/core/types";
import { BackHeader } from "./BackHeader";

export type TabScreenHeaderProps = {
  lang: Lang;
  question: string;
  title: string;
  action?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
};

export function TabScreenHeader({ lang, question, title, action, onBack, backLabel }: TabScreenHeaderProps) {
  return (
    <div className="mb-6">
      {onBack ? (
        <BackHeader lang={lang} onBack={onBack} title={backLabel} className="!px-0 !pt-0" />
      ) : null}
      <p className="mb-1 text-sm text-white/40">{question}</p>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        {action ? <div className="flex-shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
