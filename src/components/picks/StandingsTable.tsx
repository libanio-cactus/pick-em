"use client";

import { useState } from "react";
import type { WCGroup } from "@/data/groups";
import {
  QUALIFY_SLOTS,
  evaluateOrder,
  placementPoints,
  orderPotentialPoints,
  type RowState,
} from "@/data/groups";
import { TEAMS } from "@/data/teams";
import { cn } from "@/lib/cn";
import { num } from "@/lib/format";
import { CheckIcon, BallIcon } from "@/components/ui/icons";

function move<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface StandingsTableProps {
  group: WCGroup;
  order: string[];
  onReorder?: (codes: string[]) => void;
  apurado?: boolean;
  matchesFilled?: number;
  matchesTotal?: number;
  onOpenMatches?: () => void;
}

export function StandingsTable({
  group,
  order,
  onReorder,
  apurado = false,
  matchesFilled = 0,
  matchesTotal = 6,
  onOpenMatches,
}: StandingsTableProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const interactive = !!onReorder && !apurado;

  const { states, exact } = evaluateOrder(group.id, order, apurado);

  function handleDrop(to: number) {
    if (dragIndex === null || dragIndex === to) return;
    onReorder?.(move(order, dragIndex, to));
    setDragIndex(null);
    setOverIndex(null);
  }

  function nudge(from: number, dir: -1 | 1) {
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    onReorder?.(move(order, from, to));
  }

  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      {/* header do grupo */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-border">
        <h3 className="font-heading text-sm font-bold text-text">
          Grupo {group.id}
        </h3>
        {apurado ? (
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-wide",
              exact === order.length ? "text-success" : "text-text-2",
            )}
          >
            {exact}/{order.length} na posição
          </span>
        ) : (
          <span className="text-[11px] text-text-2">
            ordem exata{" "}
            <span className="font-heading font-bold text-heat tabular-nums">
              +{num(orderPotentialPoints(group.id, order))} pts
            </span>
          </span>
        )}
      </div>

      {/* linhas */}
      <ul className="p-1.5">
        {order.map((code, i) => {
          const t = TEAMS[code];
          const advances = i < QUALIFY_SLOTS;
          const state = states[code];
          const showCut = i === QUALIFY_SLOTS;
          return (
            <li key={code}>
              {showCut && (
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <span className="h-px flex-1 bg-border-strong" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-3">
                    Classifica ▲ · Eliminado ▼
                  </span>
                  <span className="h-px flex-1 bg-border-strong" />
                </div>
              )}
              <Row
                pos={i + 1}
                flag={t.flag}
                name={t.name}
                pointsForPos={placementPoints(group.id, code, i)}
                advances={advances}
                state={state}
                interactive={interactive}
                dragging={dragIndex === i}
                over={overIndex === i && dragIndex !== null && dragIndex !== i}
                onDragStart={() => setDragIndex(i)}
                onDragEnter={() => setOverIndex(i)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDrop={() => handleDrop(i)}
                onUp={i > 0 ? () => nudge(i, -1) : undefined}
                onDown={i < order.length - 1 ? () => nudge(i, 1) : undefined}
              />
            </li>
          );
        })}
      </ul>

      {/* botão full-width: definir os jogos do grupo */}
      {onOpenMatches && (
        <div className="p-1.5 pt-0">
          <button
            type="button"
            onClick={onOpenMatches}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-btn h-10 text-sm font-semibold transition-colors border",
              apurado
                ? "border-border bg-surface-2 text-text-2"
                : matchesFilled >= matchesTotal
                  ? "border-success/40 bg-success-soft text-success"
                  : matchesFilled > 0
                    ? "border-brand/50 bg-brand/10 text-brand hover:bg-brand/15"
                    : "border-border bg-surface-2 text-text hover:border-brand/50 hover:text-brand",
            )}
          >
            {apurado ? (
              <>Ver jogos do grupo · {matchesFilled}/{matchesTotal}</>
            ) : (
              <>
                <BallIcon width={16} height={16} />
                {matchesFilled > 0 ? "Editar jogos" : "Definir jogos"} ·{" "}
                {matchesFilled}/{matchesTotal}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({
  pos,
  flag,
  name,
  pointsForPos,
  advances,
  state,
  interactive,
  dragging,
  over,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
  onUp,
  onDown,
}: {
  pos: number;
  flag: string;
  name: string;
  pointsForPos: number;
  advances: boolean;
  state: RowState | undefined;
  interactive: boolean;
  dragging: boolean;
  over: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onUp?: () => void;
  onDown?: () => void;
}) {
  const apurado = state && state !== "pending";
  return (
    <div
      draggable={interactive}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-btn pl-2 pr-2.5 h-12 transition-all",
        interactive && "cursor-grab active:cursor-grabbing hover:bg-surface-2",
        dragging && "opacity-40",
        over && "ring-2 ring-brand/60",
        apurado
          ? state === "correct"
            ? "bg-success-soft"
            : state === "partial"
              ? "bg-heat-soft"
              : "bg-error-soft"
          : advances
            ? "bg-brand/[0.06]"
            : "",
      )}
    >
      {/* indicador de zona / drag handle */}
      <span
        className={cn(
          "w-1 self-stretch my-1.5 rounded-full shrink-0",
          advances && !apurado ? "bg-brand" : "bg-transparent",
        )}
        aria-hidden="true"
      />
      <span className="w-4 text-center text-xs font-bold text-text-2 tabular-nums">
        {pos}
      </span>
      <span className="text-xl leading-none" aria-hidden="true">
        {flag}
      </span>
      <span className="flex-1 text-sm font-semibold text-text truncate">
        {name}
      </span>

      {apurado ? (
        <StateBadge state={state!} />
      ) : (
        <span className="font-heading text-sm font-bold tabular-nums text-heat">
          +{num(pointsForPos)}
          <span className="text-[10px] font-medium text-text-3 ml-0.5">pts</span>
        </span>
      )}

      {/* controles de teclado/acessibilidade */}
      {interactive && (
        <span className="flex flex-col ml-0.5">
          <NudgeBtn dir="up" onClick={onUp} />
          <NudgeBtn dir="down" onClick={onDown} />
        </span>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: RowState }) {
  if (state === "correct") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-success">
        <CheckIcon width={13} height={13} /> exata
      </span>
    );
  }
  if (state === "partial") {
    return (
      <span className="text-[11px] font-bold uppercase text-heat">parcial</span>
    );
  }
  return <span className="text-[11px] font-bold uppercase text-error">errou</span>;
}

function NudgeBtn({
  dir,
  onClick,
}: {
  dir: "up" | "down";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={dir === "up" ? "Subir" : "Descer"}
      className="grid place-items-center h-4 w-5 text-text-3 hover:text-text disabled:opacity-30 transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={dir === "up" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
