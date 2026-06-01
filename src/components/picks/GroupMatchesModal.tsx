"use client";

import { Modal } from "@/components/ui/Modal";
import type { WCGroup } from "@/data/groups";
import type { Match, PickOption, PicksMap } from "@/data/types";
import { cn } from "@/lib/cn";
import { num } from "@/lib/format";
import { matchPoints } from "@/lib/scoring";
import { CheckIcon } from "@/components/ui/icons";

export function GroupMatchesModal({
  group,
  open,
  onClose,
  picks,
  onPick,
  revealedInGroup = 0,
}: {
  group: WCGroup | null;
  open: boolean;
  onClose: () => void;
  picks: PicksMap;
  onPick: (matchId: string, pick: PickOption) => void;
  revealedInGroup?: number;
}) {
  if (!group) return null;
  const filled = group.matches.filter((m) => picks[m.id]).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Jogos do Grupo ${group.id}`}
      description="Defina o resultado de cada partida: vitória, empate ou virada. Cravar zebra vale mais pontos que o favorito."
      width={540}
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-text-2">
            {filled}/{group.matches.length} definidos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-btn bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover transition-colors"
          >
            Pronto
          </button>
        </div>
      }
    >
      <ul className="flex flex-col gap-2 py-1">
        {group.matches.map((m, i) => (
          <MatchRow
            key={m.id}
            match={m}
            pick={picks[m.id]}
            apurado={i < revealedInGroup}
            onPick={(p) => onPick(m.id, p)}
          />
        ))}
      </ul>
    </Modal>
  );
}

function MatchRow({
  match,
  pick,
  apurado,
  onPick,
}: {
  match: Match;
  pick?: PickOption;
  apurado: boolean;
  onPick: (p: PickOption) => void;
}) {
  const opts: { key: PickOption; label: string; odd: number }[] = [
    { key: "a", label: match.teamA.code, odd: match.odds.a },
    { key: "draw", label: "Empate", odd: match.odds.draw },
    { key: "b", label: match.teamB.code, odd: match.odds.b },
  ];

  return (
    <li className="rounded-card border border-border bg-surface-2 p-2.5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-text">
          <span aria-hidden="true">{match.teamA.flag}</span>
          {match.teamA.code}
          <span className="text-text-3 text-xs">vs</span>
          {match.teamB.code}
          <span aria-hidden="true">{match.teamB.flag}</span>
        </span>
        <span className="text-[11px] text-text-3">{match.kickoff}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {opts.map((o) => {
          const selected = pick === o.key;
          const isResult = apurado && match.result === o.key;
          const missed = apurado && selected && match.result !== o.key;
          return (
            <button
              key={o.key}
              type="button"
              disabled={apurado}
              aria-pressed={selected}
              onClick={() => onPick(o.key)}
              className={cn(
                "flex items-center justify-between rounded-btn border h-11 px-2.5 transition-all",
                !apurado && "hover:border-brand/60 cursor-pointer",
                isResult && "border-success bg-success-soft",
                missed && "border-error bg-error-soft",
                selected && !isResult && !missed && "border-brand bg-brand/10",
                !selected && !isResult && !missed && "border-border bg-surface",
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-semibold truncate",
                  isResult ? "text-success" : missed ? "text-error" : selected ? "text-brand" : "text-text-2",
                )}
              >
                {o.label}
              </span>
              <span
                className={cn(
                  "font-heading text-sm font-bold tabular-nums ml-1",
                  isResult ? "text-success" : missed ? "text-error" : "text-heat",
                )}
              >
                {isResult ? <CheckIcon width={14} height={14} /> : `+${num(matchPoints(o.odd))}`}
              </span>
            </button>
          );
        })}
      </div>
    </li>
  );
}
