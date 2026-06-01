"use client";

import type { Standing } from "@/data/types";
import { cn } from "@/lib/cn";
import { percent } from "@/lib/format";
import { FireIcon } from "@/components/ui/icons";

const MEDAL = ["🥇", "🥈", "🥉"];

export function RankingTable({ rows }: { rows: Standing[] }) {
  return (
    <div className="flex flex-col gap-2">
      {/* cabeçalho de colunas */}
      <div className="grid grid-cols-[2.5rem_1fr_4.5rem_4rem_4rem] items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-text-3">
        <span>#</span>
        <span>Participante</span>
        <span className="text-right">Pontos</span>
        <span className="text-right">Streak</span>
        <span className="text-right">Acerto</span>
      </div>

      {rows.map((r) => {
        const isLeader = r.position === 1;
        const isUser = r.member.isCurrentUser;
        return (
          <div
            key={r.member.id}
            className={cn(
              "grid grid-cols-[2.5rem_1fr_4.5rem_4rem_4rem] items-center gap-2 rounded-card border px-3 h-14 transition-colors",
              isLeader
                ? "border-heat/50 bg-heat-soft"
                : isUser
                  ? "border-brand/40 bg-brand/5"
                  : "border-border bg-surface",
            )}
          >
            <span className="text-lg leading-none">
              {r.position <= 3 ? (
                MEDAL[r.position - 1]
              ) : (
                <span className="text-sm font-bold text-text-2 tabular-nums">
                  {r.position}
                </span>
              )}
            </span>

            <span className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "grid place-items-center h-8 w-8 rounded-full text-base shrink-0",
                  isLeader ? "bg-heat/20" : "bg-surface-2",
                )}
                aria-hidden="true"
              >
                {r.member.avatar}
              </span>
              <span className="truncate">
                <span
                  className={cn(
                    "block text-sm font-semibold truncate",
                    isLeader ? "text-text" : "text-text",
                  )}
                >
                  {r.member.name}
                </span>
                {isUser && (
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-brand">
                    você
                  </span>
                )}
              </span>
            </span>

            <span className="text-right">
              <span
                className={cn(
                  "block font-heading text-lg font-bold tabular-nums leading-none",
                  isLeader ? "text-heat" : "text-text",
                )}
              >
                {r.points}
              </span>
              <span className="block text-[10px] text-text-3 tabular-nums">
                {r.tablePts}t · {r.matchPts}j{r.bracketPts > 0 ? ` · ${r.bracketPts}m` : ""}
              </span>
            </span>

            <span className="flex items-center justify-end gap-1 text-sm tabular-nums">
              <FireIcon
                width={14}
                height={14}
                className={r.bestStreak >= 3 ? "text-heat" : "text-text-3"}
              />
              <span
                className={cn(
                  "font-semibold",
                  r.bestStreak >= 3 ? "text-heat" : "text-text-2",
                )}
              >
                {r.bestStreak}
              </span>
            </span>

            <span className="text-right text-sm font-medium text-text-2 tabular-nums">
              {r.decided > 0 ? percent(r.accuracy) : "—"}
            </span>
          </div>
        );
      })}

      <p className="mt-1 px-3 text-[11px] text-text-3">
        Pontos = jogos (j) + tabela (t) + mata-mata (m). Ranking 4fun, por
        desempenho.
      </p>
    </div>
  );
}
