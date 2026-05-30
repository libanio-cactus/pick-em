import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

/** Skeleton de um card de jogo, usado no estado loading da listagem. */
export function MatchCardSkeleton() {
  return (
    <div
      className="bg-surface border border-border rounded-card p-4"
      aria-busy="true"
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="text-4xl mb-3" aria-hidden="true">
        {icon}
      </div>
      <h3 className="font-heading text-base font-semibold text-text mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-2 max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar agora. Tente de novo em alguns segundos.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center py-14 px-6"
    >
      <div className="text-4xl mb-3" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="font-heading text-base font-semibold text-text mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-2 max-w-sm mb-5">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
