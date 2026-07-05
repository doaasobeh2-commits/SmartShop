import type { HTMLAttributes, ReactNode } from "react";
import { colors } from "../../../tokens/colors";
import { dimensions } from "../../../tokens/spacing";
import { radius } from "../../../tokens/radius";

export type PhoneFrameProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function PhoneFrame({ children, className = "", style, ...props }: PhoneFrameProps) {
  return (
    <div
      className={`relative mx-auto flex w-full min-w-0 max-w-[var(--phone-frame-max-width)] flex-col overflow-hidden bg-background ${className}`}
      style={{
        height: "var(--phone-frame-height)",
        borderRadius: "var(--phone-frame-radius)",
        border: "var(--phone-frame-border)",
        boxShadow: "var(--phone-frame-shadow)",
        background: colors.background,
        ...style,
      }}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black"
        style={{
          width: dimensions.dynamicIslandWidth,
          height: dimensions.dynamicIslandHeight,
          borderRadius: radius.dynamicIsland,
        }}
      />
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">{children}</div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2"
      >
        <div
          className="rounded-full bg-foreground-15"
          style={{
            width: dimensions.homeIndicatorWidth,
            height: dimensions.homeIndicatorHeight,
          }}
        />
      </div>
    </div>
  );
}
