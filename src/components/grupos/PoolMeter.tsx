"use client";

import type { Member } from "@/data/types";
import { FRIENDS_GROUP as GROUP, poolSummary } from "@/data/friends";
import { money, percent } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PoolMeter({
  members,
  leaderName,
}: {
  members: Member[];
  leaderName?: string;
}) {
  const pool = poolSummary(members);

  return (
    <div className="rounded-card border border-heat/40 bg-gradient-to-br from-heat-soft to-transparent p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2">
          Prêmio do pool
        </p>
        <span className="text-[11px] font-medium text-text-2">
          {pool.count} no pool
        </span>
      </div>

      <p className="font-heading text-[34px] leading-tight font-extrabold text-heat tabular-nums">
        {money(pool.prize)}
      </p>

      <div className="mt-1 text-xs text-text-2">
        {pool.count} × {money(GROUP.poolEntry)} − {percent(GROUP.houseMarginPct)}{" "}
        margem da casa
      </div>

      {/* avatares dos participantes no pool */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          {pool.participants.map((p) => (
            <span
              key={p.id}
              title={p.name}
              className={cn(
                "grid place-items-center h-8 w-8 rounded-full border-2 border-surface bg-surface-2 text-sm",
                p.isCurrentUser && "ring-2 ring-brand",
              )}
              aria-hidden="true"
            >
              {p.avatar}
            </span>
          ))}
        </div>
        <span className="text-xs text-text-3">
          entraram com {money(GROUP.poolEntry)}
        </span>
      </div>

      {leaderName && (
        <div className="mt-4 rounded-btn border border-heat/30 bg-base/40 px-3 py-2.5 text-xs text-text-2">
          Quem terminar a fase em 1º leva o prêmio. Agora:{" "}
          <span className="text-heat font-semibold">{leaderName}</span> na frente.
        </div>
      )}
    </div>
  );
}
