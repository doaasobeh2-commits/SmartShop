import type { ReactNode } from "react";

type LivingKitchenPanelProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Warm cream content surface with restrained kitchen atmosphere.
 * Prefer this over flat white for all non–Cook Mode screens.
 */
export function LivingKitchenPanel({
  children,
  className = "",
}: LivingKitchenPanelProps) {
  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col ${className}`.trim()}
      style={{
        backgroundColor: "var(--warm-white)",
        backgroundImage: [
          "radial-gradient(ellipse 90% 55% at 100% -10%, rgba(213, 171, 123, 0.14), transparent 55%)",
          "radial-gradient(ellipse 70% 50% at -15% 110%, rgba(90, 64, 48, 0.06), transparent 50%)",
          "linear-gradient(180deg, #f7f3ed 0%, var(--warm-white) 28%, var(--warm-white) 72%, #f4efe8 100%)",
        ].join(", "),
      }}
    >
      {children}
    </div>
  );
}
