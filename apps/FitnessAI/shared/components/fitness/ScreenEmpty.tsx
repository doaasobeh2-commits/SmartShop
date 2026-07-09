import type { ReactNode } from "react";

export type ScreenEmptyProps = {
  message: string;
  action?: ReactNode;
};

export function ScreenEmpty({ message, action }: ScreenEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
      <p className="text-sm leading-relaxed text-white/45">{message}</p>
      {action}
    </div>
  );
}
