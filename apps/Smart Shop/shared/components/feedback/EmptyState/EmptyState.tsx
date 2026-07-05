import type { HTMLAttributes, ReactNode } from "react";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  children?: ReactNode;
};

export function EmptyState(_props: EmptyStateProps) {
  return null;
}
