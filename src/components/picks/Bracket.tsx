"use client";

import {
  buildBracket,
  ACTUAL_BRACKET,
  type BracketPicks,
  type ResolvedTie,
  type TieId,
} from "@/data/bracket";
import type { Team } from "@/data/types";
import { cn } from "@/lib/cn";
import { CheckIcon, TrophyIcon } from "@/components/ui/icons";

interface BracketProps {
  picks: BracketPicks;
  onPick?: (tie: TieId, teamCode: string) => void;
  apurado?: boolean;
}

export function Bracket({ picks, onPick, apurado = false }: BracketProps) {
  const b = buildBracket(picks);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-3 md:gap-5 min-w-[640px]">
        <Column title="Quartas">
          {b.quarters.map((t) => (
            <Tie key={t.tie} tie={t} onPick={onPick} apurado={apurado} />
          ))}
        </Column>
        <Column title="Semifinal">
          {b.semis.map((t) => (
            <Tie key={t.tie} tie={t} onPick={onPick} apurado={apurado} />
          ))}
        </Column>
        <Column title="Final">
          <Tie tie={b.final} onPick={onPick} apurado={apurado} />
        </Column>
        <ChampionCard champion={b.champion} apurado={apurado} />
      </div>
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col min-w-[150px]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-3 mb-2 text-center">
        {title}
      </p>
      <div className="flex flex-1 flex-col justify-around gap-3">{children}</div>
    </div>
  );
}

function Tie({
  tie,
  onPick,
  apurado,
}: {
  tie: ResolvedTie;
  onPick?: (tie: TieId, code: string) => void;
  apurado: boolean;
}) {
  const actualWinner = apurado ? ACTUAL_BRACKET[tie.tie] : null;
  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      <Slot
        team={tie.a}
        tieId={tie.tie}
        picked={!!tie.pick && tie.a?.code === tie.pick}
        isWinner={actualWinner != null && tie.a?.code === actualWinner}
        missed={
          apurado &&
          !!tie.pick &&
          tie.a?.code === tie.pick &&
          tie.pick !== actualWinner
        }
        onPick={onPick}
        disabled={!tie.a || apurado}
      />
      <div className="h-px bg-border" />
      <Slot
        team={tie.b}
        tieId={tie.tie}
        picked={!!tie.pick && tie.b?.code === tie.pick}
        isWinner={actualWinner != null && tie.b?.code === actualWinner}
        missed={
          apurado &&
          !!tie.pick &&
          tie.b?.code === tie.pick &&
          tie.pick !== actualWinner
        }
        onPick={onPick}
        disabled={!tie.b || apurado}
      />
    </div>
  );
}

function Slot({
  team,
  tieId,
  picked,
  isWinner,
  missed,
  onPick,
  disabled,
}: {
  team: Team | null;
  tieId: TieId;
  picked: boolean;
  isWinner: boolean;
  missed: boolean;
  onPick?: (tie: TieId, code: string) => void;
  disabled: boolean;
}) {
  const interactive = !disabled && !!onPick && !!team;
  return (
    <button
      type="button"
      disabled={!interactive}
      aria-pressed={picked}
      aria-label={team ? `Avançar ${team.name}` : "A definir"}
      onClick={interactive ? () => onPick!(tieId, team!.code) : undefined}
      className={cn(
        "flex w-full items-center gap-2 px-2.5 h-11 transition-colors",
        interactive && "cursor-pointer hover:bg-surface-2",
        isWinner && "bg-success-soft",
        missed && "bg-error-soft",
        picked && !isWinner && !missed && "bg-brand/12",
      )}
    >
      <span className="text-lg leading-none w-6 text-center" aria-hidden="true">
        {team?.flag ?? "·"}
      </span>
      <span
        className={cn(
          "flex-1 text-left text-xs font-semibold truncate",
          !team && "text-text-3",
          isWinner ? "text-success" : missed ? "text-error" : team ? "text-text" : "",
        )}
      >
        {team ? team.code : "A definir"}
      </span>
      {isWinner ? (
        <CheckIcon width={14} height={14} className="text-success shrink-0" />
      ) : missed ? (
        <span className="text-error text-xs font-bold shrink-0">✕</span>
      ) : picked ? (
        <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
      ) : null}
    </button>
  );
}

function ChampionCard({
  champion,
  apurado,
}: {
  champion: Team | null;
  apurado: boolean;
}) {
  const actualChamp = apurado ? ACTUAL_BRACKET.fi : null;
  const correct = apurado && champion?.code === actualChamp;
  const wrong = apurado && champion != null && champion.code !== actualChamp;

  return (
    <div className="flex flex-col min-w-[150px]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-heat mb-2 text-center">
        Campeão
      </p>
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center rounded-card border p-4 text-center",
          correct
            ? "border-success/50 bg-success-soft"
            : wrong
              ? "border-error/40 bg-error-soft"
              : champion
                ? "border-heat/50 bg-heat-soft streak-glow"
                : "border-dashed border-border bg-surface",
        )}
      >
        <TrophyIcon
          width={26}
          height={26}
          className={cn(
            "mb-2",
            correct ? "text-success" : wrong ? "text-error" : "text-heat",
          )}
        />
        {champion ? (
          <>
            <span className="text-3xl leading-none mb-1" aria-hidden="true">
              {champion.flag}
            </span>
            <span
              className={cn(
                "font-heading text-sm font-bold",
                correct ? "text-success" : wrong ? "text-error" : "text-text",
              )}
            >
              {champion.name}
            </span>
            {apurado && (
              <span
                className={cn(
                  "mt-1 text-[10px] font-bold uppercase tracking-wide",
                  correct ? "text-success" : "text-error",
                )}
              >
                {correct ? "cravou o campeão!" : "não foi dessa vez"}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-text-3">
            Complete o bracket para definir seu campeão
          </span>
        )}
      </div>
    </div>
  );
}
