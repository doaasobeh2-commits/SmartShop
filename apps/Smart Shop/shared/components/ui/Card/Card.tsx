import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children?: ReactNode;
};

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: ReactNode;
};

export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`flex flex-col gap-6 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div className={`px-6 pt-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: CardTitleProps) {
  return (
    <h3 className={`text-base font-semibold leading-none ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-[var(--muted-foreground)] ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }: CardContentProps) {
  return (
    <div className={`px-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }: CardFooterProps) {
  return (
    <div className={`px-6 pb-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
