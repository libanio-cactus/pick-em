import { TEAMS } from "./teams";
import { groupPlace, pointsFromOdd } from "./groups";
import type { Team, TieId, BracketPicks } from "./types";

export type { TieId, BracketPicks } from "./types";

export type Round = "Oitavas" | "Quartas" | "Semifinal" | "Final";

// Força relativa de cada seleção (define as odds 2-way de cada chave).
const STRENGTH: Record<string, number> = {
  MEX: 74, KOR: 71, RSA: 60, CZE: 57,
  SUI: 77, CAN: 73, BIH: 62, QAT: 52,
  BRA: 93, MAR: 79, SCO: 61, HAI: 48,
  ARG: 91, NOR: 76, NGA: 70, AUS: 57,
};

const MARGIN = 0.94; // overround da casa aplicado aos dois lados

/** Odds 2-way (sem empate) de uma chave entre dois times. */
export function tieOdds(aCode: string, bCode: string): { a: number; b: number } {
  const sa = STRENGTH[aCode] ?? 60;
  const sb = STRENGTH[bCode] ?? 60;
  const pa = sa / (sa + sb);
  const round2 = (x: number) => Math.max(1.05, Math.round((x / MARGIN) * 100) / 100);
  return { a: round2(1 / pa), b: round2(1 / (1 - pa)) };
}

interface TieDef {
  tie: TieId;
  round: Round;
  seeds?: [[string, number], [string, number]]; // oitavas: [grupo, posição]
  from?: [TieId, TieId]; // fases seguintes: vencedores de duas chaves
}

const OITAVAS: TieDef[] = [
  { tie: "o1", round: "Oitavas", seeds: [["A", 1], ["C", 4]] },
  { tie: "o2", round: "Oitavas", seeds: [["B", 2], ["D", 3]] },
  { tie: "o3", round: "Oitavas", seeds: [["C", 1], ["A", 4]] },
  { tie: "o4", round: "Oitavas", seeds: [["D", 2], ["B", 3]] },
  { tie: "o5", round: "Oitavas", seeds: [["B", 1], ["D", 4]] },
  { tie: "o6", round: "Oitavas", seeds: [["A", 2], ["C", 3]] },
  { tie: "o7", round: "Oitavas", seeds: [["D", 1], ["B", 4]] },
  { tie: "o8", round: "Oitavas", seeds: [["C", 2], ["A", 3]] },
];
const QUARTAS: TieDef[] = [
  { tie: "q1", round: "Quartas", from: ["o1", "o2"] },
  { tie: "q2", round: "Quartas", from: ["o3", "o4"] },
  { tie: "q3", round: "Quartas", from: ["o5", "o6"] },
  { tie: "q4", round: "Quartas", from: ["o7", "o8"] },
];
const SEMIS: TieDef[] = [
  { tie: "s1", round: "Semifinal", from: ["q1", "q2"] },
  { tie: "s2", round: "Semifinal", from: ["q3", "q4"] },
];
const FINAL: TieDef = { tie: "fi", round: "Final", from: ["s1", "s2"] };

export const TIE_DEFS: TieDef[] = [...OITAVAS, ...QUARTAS, ...SEMIS, FINAL];
export const ALL_TIES: TieId[] = TIE_DEFS.map((t) => t.tie);
const DEF = new Map(TIE_DEFS.map((t) => [t.tie, t]));

export const ROUNDS: { round: Round; ties: TieId[] }[] = [
  { round: "Oitavas", ties: OITAVAS.map((t) => t.tie) },
  { round: "Quartas", ties: QUARTAS.map((t) => t.tie) },
  { round: "Semifinal", ties: SEMIS.map((t) => t.tie) },
  { round: "Final", ties: ["fi"] },
];

// Resultado real do mata-mata (campeão: ARG).
export const ACTUAL_BRACKET: Record<TieId, string> = {
  o1: "KOR", o2: "CAN", o3: "BRA", o4: "NGA",
  o5: "SUI", o6: "MEX", o7: "ARG", o8: "MAR",
  q1: "CAN", q2: "BRA", q3: "SUI", q4: "ARG",
  s1: "BRA", s2: "ARG",
  fi: "ARG",
};

export interface ResolvedTie {
  tie: TieId;
  round: Round;
  a: Team | null;
  b: Team | null;
  pick: string | null;
  ptsA: number | null; // pontos por cravar o lado A (pela odd)
  ptsB: number | null;
}

export interface BracketState {
  rounds: { round: Round; ties: ResolvedTie[] }[];
  champion: Team | null;
}

function team(code: string | null | undefined): Team | null {
  return code ? TEAMS[code] ?? null : null;
}

function sidesOf(tie: TieId, picks: BracketPicks): [string | null, string | null] {
  const def = DEF.get(tie)!;
  if (def.seeds) {
    return [groupPlace(def.seeds[0][0], def.seeds[0][1]), groupPlace(def.seeds[1][0], def.seeds[1][1])];
  }
  const [ta, tb] = def.from!;
  return [picks[ta] ?? null, picks[tb] ?? null];
}

/** Lados reais de uma chave (independe dos picks) — para apuração. */
function actualSidesOf(tie: TieId): [string | null, string | null] {
  const def = DEF.get(tie)!;
  if (def.seeds) {
    return [groupPlace(def.seeds[0][0], def.seeds[0][1]), groupPlace(def.seeds[1][0], def.seeds[1][1])];
  }
  const [ta, tb] = def.from!;
  return [ACTUAL_BRACKET[ta] ?? null, ACTUAL_BRACKET[tb] ?? null];
}

export function tieSides(tie: TieId, picks: BracketPicks): [string | null, string | null] {
  return sidesOf(tie, picks);
}

export function buildBracket(picks: BracketPicks): BracketState {
  const resolve = (tie: TieId): ResolvedTie => {
    const def = DEF.get(tie)!;
    const [a, b] = sidesOf(tie, picks);
    const odds = a && b ? tieOdds(a, b) : null;
    return {
      tie,
      round: def.round,
      a: team(a),
      b: team(b),
      pick: picks[tie] ?? null,
      ptsA: odds ? pointsFromOdd(odds.a) : null,
      ptsB: odds ? pointsFromOdd(odds.b) : null,
    };
  };
  return {
    rounds: ROUNDS.map((r) => ({ round: r.round, ties: r.ties.map(resolve) })),
    champion: team(picks.fi),
  };
}

export function applyBracketPick(picks: BracketPicks, tie: TieId, code: string): BracketPicks {
  const next: BracketPicks = { ...picks };
  if (next[tie] === code) delete next[tie];
  else next[tie] = code;

  let changed = true;
  while (changed) {
    changed = false;
    for (const def of TIE_DEFS) {
      if (!def.from) continue;
      const picked = next[def.tie];
      if (!picked) continue;
      if (!def.from.some((src) => next[src] === picked)) {
        delete next[def.tie];
        changed = true;
      }
    }
  }
  return next;
}

export function bracketTally(picks: BracketPicks) {
  let correct = 0;
  let points = 0;
  const perTie = {} as Record<TieId, boolean | null>;
  for (const tie of ALL_TIES) {
    const pick = picks[tie];
    if (!pick) {
      perTie[tie] = null;
      continue;
    }
    const winner = ACTUAL_BRACKET[tie];
    const ok = pick === winner;
    perTie[tie] = ok;
    if (ok) {
      correct++;
      // pontos pela odd do vencedor no confronto REAL daquela chave
      const [a, b] = actualSidesOf(tie);
      if (a && b) {
        const odds = tieOdds(a, b);
        points += pointsFromOdd(winner === a ? odds.a : odds.b);
      }
    }
  }
  const filled = ALL_TIES.filter((t) => picks[t]).length;
  return { correct, points, filled, total: ALL_TIES.length, perTie };
}
