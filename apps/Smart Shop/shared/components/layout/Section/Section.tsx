import type { HTMLAttributes, ReactNode } from "react";

export type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children?: ReactNode;
};

export function Section(_props: SectionProps) {
  return null;
}
