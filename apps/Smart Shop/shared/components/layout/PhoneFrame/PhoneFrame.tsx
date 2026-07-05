import type { HTMLAttributes, ReactNode } from "react";
import { colors } from "../../../tokens/colors";
import { dimensions } from "../../../tokens/spacing";
import { radius } from "../../../tokens/radius";
import { shadows } from "../../../tokens/shadows";

export type PhoneFrameProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function PhoneFrame({ children, className = "", style, ...props }: PhoneFrameProps) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden bg-background ${className}`}
      style={{
        width: dimensions.phoneWidth,
        height: dimensions.phoneHeight,
        borderRadius: radius.phone,
        border: `2px solid ${colors.phoneFrameBorder}`,
        boxShadow: shadows.phoneFrame,
        background: colors.background,
        ...style,
      }}
      {...props}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black"
        style={{
          width: dimensions.dynamicIslandWidth,
          height: dimensions.dynamicIslandHeight,
          borderRadius: radius.dynamicIsland,
        }}
      />
      <div className="flex-1 overflow-hidden">{children}</div>
      <div className="flex justify-center pb-2 pt-1">
        <div className="h-1 w-24 rounded-full bg-foreground-15" />
      </div>
    </div>
  );
}
