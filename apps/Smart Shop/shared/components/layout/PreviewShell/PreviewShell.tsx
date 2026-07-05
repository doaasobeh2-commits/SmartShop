import type { ReactNode } from "react";
import { gradients, shadows } from "../../../tokens";
import { SparklesIcon } from "../../ui/SparklesIcon";

const BADGE_LABELS = ["12 Screens", "Bravo Ready", "Flat Architecture", "Deutsch"] as const;

export function BrandHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-3 flex items-center justify-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: gradients.brand,
            boxShadow: shadows.brandIcon,
          }}
        >
          <SparklesIcon size={17} />
        </div>
        <h1
          className="text-xl font-black tracking-[0.12em] text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          SMARTSHOP AI
        </h1>
      </div>

      <p className="mb-2 text-sm text-muted-foreground">Intelligente Einkaufsplanung</p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {BADGE_LABELS.map((label) => (
          <div
            key={label}
            className="rounded-full border border-accent-25 bg-accent-10 px-2.5 py-1"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-accent">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type ScreenFooterProps = {
  screenNumber: number;
  totalScreens?: number;
};

export function ScreenFooter({ screenNumber, totalScreens = 12 }: ScreenFooterProps) {
  return (
    <p className="mt-5 text-[11px] tracking-wide text-muted-foreground-50">
      Screen {screenNumber} / {totalScreens} · Bravo Studio Optimiert
    </p>
  );
}

export type PreviewShellProps = {
  screenNumber: number;
  children: ReactNode;
};

export function PreviewShell({ screenNumber, children }: PreviewShellProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{
        background: gradients.appBackground,
        fontFamily: "var(--font-sans)",
      }}
    >
      <BrandHeader />
      {children}
      <ScreenFooter screenNumber={screenNumber} />
    </div>
  );
}
