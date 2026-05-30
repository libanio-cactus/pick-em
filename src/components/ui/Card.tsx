import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <As
      className={cn(
        "bg-surface border border-border rounded-card shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-heading text-base font-semibold text-text tracking-tight",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-2">
      {children}
    </span>
  );
}
