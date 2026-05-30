"use client";

import { cn } from "@/lib/cn";
import { FireIcon } from "@/components/ui/icons";
import {
  STREAK_TIERS,
  FULL_PHASE_BONUS,
  FULL_PHASE_LABEL,
  streakBonus,
  streakTierLabel,
} from "@/lib/scoring";
import { percent } from "@/lib/format";

/** Escada de tiers de streak com o tier atual destacado. */
export function StreakLadder({
  bestStreak,
  className,
}: {
  bestStreak: number;
  className?: string;
}) {
  const tiers = [
    ...STREAK_TIERS.map((t) => ({ min: t.min, bonus: t.bonus, label: t.label })),
    { min: 99, bonus: FULL_PHASE_BONUS, label: FULL_PHASE_LABEL },
  ];
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {tiers.map((t) => {
        const reached = bestStreak >= t.min;
        return (
          <li
            key={t.label}
            className={cn(
              "flex items-center justify-between rounded-btn px-3 h-9 text-sm border transition-colors",
              reached
                ? "border-heat/40 bg-heat-soft text-text"
                : "border-border bg-surface-2 text-text-2",
            )}
          >
            <span className="flex items-center gap-2">
              <FireIcon
                width={16}
                height={16}
                className={reached ? "text-heat" : "text-text-3"}
              />
              {t.label}
            </span>
            <span
              className={cn(
                "font-heading font-bold tabular-nums",
                reached ? "text-heat" : "text-text-3",
              )}
            >
              +{percent(t.bonus)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Badge compacto do streak atual, com glow dourado quando ativo (≥3). */
export function StreakBadge({
  bestStreak,
  correct,
  decided,
}: {
  bestStreak: number;
  correct: number;
  decided: number;
}) {
  const bonus = streakBonus(bestStreak, correct, decided);
  const label = streakTierLabel(bestStreak, correct, decided);
  const active = bonus > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-card border p-3 transition-colors",
        active
          ? "border-heat/50 bg-heat-soft streak-glow"
          : "border-border bg-surface-2",
      )}
    >
      <span
        className={cn(
          "grid place-items-center h-11 w-11 rounded-full shrink-0",
          active ? "bg-heat/20 text-heat" : "bg-surface-3 text-text-3",
        )}
      >
        <FireIcon width={22} height={22} />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-heading text-2xl font-bold tabular-nums leading-none",
              active ? "text-heat" : "text-text",
            )}
          >
            {bestStreak}
          </span>
          <span className="text-xs text-text-2">seguidos</span>
        </div>
        <p className="text-xs text-text-2 mt-0.5">
          {active ? (
            <>
              {label} ·{" "}
              <span className="text-heat font-semibold">
                +{percent(bonus)} no retorno
              </span>
            </>
          ) : (
            "Acerte 3 seguidos para ativar o bônus"
          )}
        </p>
      </div>
    </div>
  );
}
