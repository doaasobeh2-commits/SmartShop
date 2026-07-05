import type { HTMLAttributes, ReactNode } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
};

export function Badge(_props: BadgeProps) {
  return null;
}
