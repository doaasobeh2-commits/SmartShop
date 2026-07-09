import type { ReactNode } from "react";

export type ScreenPageProps = {
  children: ReactNode;
  dir?: "ltr" | "rtl";
  className?: string;
};

/** Consistent scrollable tab content — safe padding above bottom nav. */
export function ScreenPage({ children, dir = "ltr", className = "" }: ScreenPageProps) {
  return (
    <div className={`flex flex-col gap-5 pb-28 ${className}`} dir={dir}>
      <div className="px-5 pt-2">{children}</div>
    </div>
  );
}
