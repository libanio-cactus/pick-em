import { TEAMS } from "./teams";
import { qualifiers } from "./groups";
import type { Team } from "./types";

export type TieId = "qf1" | "qf2" | "qf3" | "qf4" | "sf1" | "sf2" | "fi";
export type BracketPicks = Partial<Record<TieId, string>>;

export interface Seed {
  tie: TieId;
  round: "Quartas" | "Semifinal" | "Final";
  a: string | null;
  b: string | null;
}

// Quartas semeadas a partir dos classificados reais (cruzando 1º x 2º entre grupos)
function seedQuarters(): Seed[] {
  const q = qualifiers();
  const code = (g: string, p: number) =>
    q.find((x) => x.group === g && x.pos === p)!.code;
  return [
    { tie: "qf1", round: "Quartas", a: code("A", 1), b: code("B", 2) },
    { tie: "qf2", round: "Quartas", a: code("B", 1), b: code("A", 2) },
    { tie: "qf3", round: "Quartas", a: code("C", 1), b: code("D", 2) },
    { tie: "qf4", round: "Quartas", a: code("D", 1), b: code("C", 2) },
  ];
}

export const QUARTERS: Seed[] = seedQuarters();

// Resultado real do mata-mata
export const ACTUAL_BRACKET: Record<TieId, string> = {
  qf1: "CAN",
  qf2: "SUI",
  qf3: "BRA",
  qf4: "ARG",
  sf1: "SUI",
  sf2: "ARG",
  fi: "ARG",
};

export const TIE_POINTS: Record<TieId, number> = {
  qf1: 10,
  qf2: 10,
  qf3: 10,
  qf4: 10,
  sf1: 20,
  sf2: 20,
  fi: 40,
};

export const ALL_TIES: TieId[] = ["qf1", "qf2", "qf3", "qf4", "sf1", "sf2", "fi"];

export interface ResolvedTie {
  tie: TieId;
  round: "Quartas" | "Semifinal" | "Final";
  a: Team | null;
  b: Team | null;
  pick: string | null;
}

export interface BracketState {
  quarters: ResolvedTie[];
  semis: ResolvedTie[];
  final: ResolvedTie;
  champion: Team | null;
}

function team(code: string | null | undefined): Team | null {
  return code ? TEAMS[code] ?? null : null;
}

export function buildBracket(picks: BracketPicks): BracketState {
  const quarters: ResolvedTie[] = QUARTERS.map((s) => ({
    tie: s.tie,
    round: s.round,
    a: team(s.a),
    b: team(s.b),
    pick: picks[s.tie] ?? null,
  }));

  const semis: ResolvedTie[] = [
    {
      tie: "sf1",
      round: "Semifinal",
      a: team(picks.qf1),
      b: team(picks.qf2),
      pick: picks.sf1 ?? null,
    },
    {
      tie: "sf2",
      round: "Semifinal",
      a: team(picks.qf3),
      b: team(picks.qf4),
      pick: picks.sf2 ?? null,
    },
  ];

  const final: ResolvedTie = {
    tie: "fi",
    round: "Final",
    a: team(picks.sf1),
    b: team(picks.sf2),
    pick: picks.fi ?? null,
  };

  return { quarters, semis, final, champion: team(picks.fi) };
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
    const ok = pick === ACTUAL_BRACKET[tie];
    perTie[tie] = ok;
    if (ok) {
      correct++;
      points += TIE_POINTS[tie];
    }
  }
  const filled = ALL_TIES.filter((t) => picks[t]).length;
  return { correct, points, filled, total: ALL_TIES.length, perTie };
}
