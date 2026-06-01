"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderMap, PicksMap } from "@/data/types";
import {
  rawMatchPoints,
  projectedMatchPoints,
  projectedTablePoints,
  projectedBonusFor,
} from "@/lib/scoring";
import { num, pts, percent } from "@/lib/format";
import { cn } from "@/lib/cn";
import { FireIcon } from "@/components/ui/icons";

function AnimatedNum({ value, className }: { value: number; className?: string }) {
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
      {num(value)}
    </span>
  );
}

export function PointsMeter({
  picks,
  orders,
  variant = "panel",
}: {
  picks: PicksMap;
  orders: OrderMap;
  variant?: "panel" | "compact";
}) {
  const count = Object.keys(picks).length;
  const rawMatch = rawMatchPoints(picks);
  const projMatch = projectedMatchPoints(picks);
  const projTable = projectedTablePoints(orders);
  const projBonus = projectedBonusFor(count);
  const totalProj = projMatch + projTable;

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-card border border-heat/40 bg-heat-soft px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-2">Pontos possíveis</p>
          <AnimatedNum value={totalProj} className="font-heading text-2xl font-bold text-heat" />
        </div>
        <p className="text-xs text-text-2 text-right">
          jogos + tabela
          <br />
          acertando tudo
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-heat/40 bg-gradient-to-br from-heat-soft to-transparent p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2">
        Pontos possíveis
      </p>
      <div className="flex items-baseline gap-1.5">
        <AnimatedNum value={totalProj} className="font-heading text-[40px] leading-tight font-extrabold text-heat" />
        <span className="font-heading text-lg font-bold text-heat">pts</span>
      </div>
      <p className="mt-0.5 text-xs text-text-2">acertando tudo que você palpitou</p>

      <div className="mt-4 flex flex-col gap-2">
        <Breakdown label="Jogos" hint={`${count} ${count === 1 ? "palpite" : "palpites"} por dificuldade`} value={projMatch} />
        <Breakdown label="Tabela" hint="classificação exata dos grupos" value={projTable} />
      </div>

      {count > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-btn border border-heat/30 bg-base/40 px-3 py-2.5">
          <FireIcon width={18} height={18} className="text-heat shrink-0" />
          <p className="text-xs text-text-2">
            Streak já embutido:{" "}
            <span className="text-heat font-semibold">+{percent(projBonus)}</span> nos{" "}
            {pts(rawMatch)} base dos jogos.
          </p>
        </div>
      )}
    </div>
  );
}

function Breakdown({ label, hint, value }: { label: string; hint: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-btn bg-base/40 px-3 py-2">
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-text">{label}</span>
        <span className="block text-[11px] text-text-3 truncate">{hint}</span>
      </span>
      <span className="font-heading text-base font-bold text-heat tabular-nums">
        <AnimatedNum value={value} /> <span className="text-xs">pts</span>
      </span>
    </div>
  );
}
