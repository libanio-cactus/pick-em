"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderMap, PicksMap } from "@/data/types";
import {
  baseReturn,
  oddsMultiplier,
  maxProjectedReturn,
  projectedBonusFor,
  projectedTableReturn,
} from "@/lib/scoring";
import { money, multiplier, percent } from "@/lib/format";
import { cn } from "@/lib/cn";
import { FireIcon } from "@/components/ui/icons";

function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  const [pop, setPop] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setPop(true);
      const t = setTimeout(() => setPop(false), 360);
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <span className={cn("inline-block tabular-nums", pop && "value-pop", className)}>
      {money(value)}
    </span>
  );
}

export function ReturnMeter({
  stake,
  picks,
  orders,
  variant = "panel",
}: {
  stake: number;
  picks: PicksMap;
  orders: OrderMap;
  variant?: "panel" | "compact";
}) {
  const count = Object.keys(picks).length;
  const mult = oddsMultiplier(picks);
  const gamesBase = baseReturn(stake, picks);
  const gamesMax = maxProjectedReturn(stake, picks);
  const tableProj = projectedTableReturn(stake, orders);
  const projBonus = projectedBonusFor(count);

  const totalPotential = gamesBase + tableProj;
  const totalMax = gamesMax + tableProj;

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-card border border-heat/40 bg-heat-soft px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-2">
            Retorno potencial
          </p>
          <AnimatedMoney
            value={totalPotential}
            className="font-heading text-2xl font-bold text-heat"
          />
        </div>
        <p className="text-xs text-text-2 text-right">
          jogos + tabela
          <br />
          <span className="text-heat font-semibold">{multiplier(mult)}</span> nos jogos
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-heat/40 bg-gradient-to-br from-heat-soft to-transparent p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2">
        Retorno potencial
      </p>
      <AnimatedMoney
        value={totalPotential}
        className="font-heading text-[40px] leading-tight font-extrabold text-heat"
      />
      <p className="mt-0.5 text-xs text-text-2">
        {money(stake)} apostados · jogos + ordem da tabela
      </p>

      {/* quebra: jogos x tabela */}
      <div className="mt-4 flex flex-col gap-2">
        <Breakdown
          label="Jogos"
          hint={`${count} ${count === 1 ? "pick" : "picks"} · ${multiplier(mult)}`}
          value={gamesBase}
        />
        <Breakdown
          label="Tabela"
          hint="ordem exata dos 4 grupos"
          value={tableProj}
        />
      </div>

      {count > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-btn border border-heat/30 bg-base/40 px-3 py-2.5">
          <FireIcon width={18} height={18} className="text-heat shrink-0" />
          <p className="text-xs text-text-2">
            Com <span className="text-heat font-semibold">+{percent(projBonus)} de streak</span>{" "}
            nos jogos → até{" "}
            <AnimatedMoney value={totalMax} className="text-heat font-bold" />
          </p>
        </div>
      )}
    </div>
  );
}

function Breakdown({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-btn bg-base/40 px-3 py-2">
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-text">{label}</span>
        <span className="block text-[11px] text-text-3 truncate">{hint}</span>
      </span>
      <AnimatedMoney value={value} className="font-heading text-base font-bold text-heat" />
    </div>
  );
}
