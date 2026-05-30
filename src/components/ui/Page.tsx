import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 md:px-6 py-6 md:py-8", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-text">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-text-2 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
