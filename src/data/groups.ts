import { TEAMS } from "./teams";
import type { Match, PickOption } from "./types";

export interface WCGroup {
  id: string; // "A".."D"
  seed: string[]; // times em ordem de força (0 = mais forte) — ordem inicial da tabela
  advanceOdds: Record<string, number>; // odd de classificar (top-2)
  actualOrder: string[]; // classificação final real (para apuração da tabela)
  matches: Match[]; // 6 jogos (turno único)
}

// Pares do mata-mata interno do grupo (4 times → 6 jogos)
const RR_PAIRS: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
];

function oddsFor(si: number, sj: number): Match["odds"] {
  const gap = Math.abs(si - sj);
  const strong = [1.55, 1.4, 1.3][gap - 1] ?? 1.4;
  const weak = [3.9, 5.0, 7.0][gap - 1] ?? 5;
  const draw = [3.5, 3.8, 4.2][gap - 1] ?? 3.7;
  return si < sj
    ? { a: strong, draw, b: weak }
    : { a: weak, draw, b: strong };
}

interface GroupDef {
  id: string;
  seed: string[];
  advanceOdds: Record<string, number>;
  actualOrder: string[];
  // override de resultado por índice de jogo (0..5). Default: favorito vence.
  results?: Partial<Record<number, PickOption>>;
}

const DEFS: GroupDef[] = [
  {
    id: "A",
    seed: ["MEX", "KOR", "RSA", "CZE"],
    advanceOdds: { MEX: 1.65, KOR: 1.8, RSA: 2.9, CZE: 3.4 },
    actualOrder: ["KOR", "MEX", "RSA", "CZE"],
    results: { 0: "b", 3: "draw" }, // KOR bate MEX; zebra/empate
  },
  {
    id: "B",
    seed: ["CAN", "SUI", "BIH", "QAT"],
    advanceOdds: { CAN: 1.75, SUI: 1.7, BIH: 3.3, QAT: 4.5 },
    actualOrder: ["SUI", "CAN", "BIH", "QAT"],
    results: { 0: "b", 4: "draw" },
  },
  {
    id: "C",
    seed: ["BRA", "MAR", "SCO", "HAI"],
    advanceOdds: { BRA: 1.25, MAR: 1.95, SCO: 3.8, HAI: 6.5 },
    actualOrder: ["BRA", "MAR", "SCO", "HAI"],
    results: { 5: "draw" },
  },
  {
    id: "D",
    seed: ["ARG", "NOR", "NGA", "AUS"],
    advanceOdds: { ARG: 1.35, NOR: 2.1, NGA: 2.8, AUS: 4.2 },
    actualOrder: ["ARG", "NGA", "NOR", "AUS"],
    results: { 3: "b", 1: "draw" }, // NGA na frente da NOR
  },
];

function buildGroup(def: GroupDef): WCGroup {
  const matches: Match[] = RR_PAIRS.map(([i, j], idx) => {
    const codeA = def.seed[i];
    const codeB = def.seed[j];
    const odds = oddsFor(i, j);
    const fav: PickOption = i < j ? "a" : "b";
    const result = def.results?.[idx] ?? fav;
    return {
      id: `${def.id}${idx + 1}`,
      group: def.id,
      teamA: TEAMS[codeA],
      teamB: TEAMS[codeB],
      kickoff: `Rodada ${Math.floor(idx / 2) + 1}`,
      odds,
      result,
    };
  });
  return {
    id: def.id,
    seed: def.seed,
    advanceOdds: def.advanceOdds,
    actualOrder: def.actualOrder,
    matches,
  };
}

export const GROUPS: WCGroup[] = DEFS.map(buildGroup);

// Todos os jogos numa sequência única (para acumuladora, streak e simulação)
export const ALL_MATCHES: Match[] = GROUPS.flatMap((g) => g.matches);
export const TOTAL_MATCHES = ALL_MATCHES.length;
export const QUALIFY_SLOTS = 2; // top-2 de cada grupo classifica

export function getGroup(id: string): WCGroup | undefined {
  return GROUPS.find((g) => g.id === id);
}

// Odd de um time TERMINAR numa posição: linha = força (seed 0=mais forte),
// coluna = posição prevista (0=1º .. 3=4º). Mudar o time de lugar muda a odd.
const PLACEMENT_ODDS: number[][] = [
  [1.55, 2.3, 4.8, 9.5], // mais forte: provável em cima, longshot embaixo
  [2.4, 2.0, 3.2, 6.0],
  [4.6, 3.2, 2.3, 3.3],
  [9.5, 5.6, 3.0, 1.85], // mais fraco: provável embaixo
];

/** Odd de `code` terminar na posição `position` (0-based) do seu grupo. */
export function placementOdd(groupId: string, code: string, position: number): number {
  const g = getGroup(groupId)!;
  const seedRank = g.seed.indexOf(code); // 0 = mais forte
  return PLACEMENT_ODDS[seedRank]?.[position] ?? 3.0;
}

/** Odd combinada da ordem prevista de um grupo (produto das 4 colocações). */
export function orderOdd(groupId: string, order: string[]): number {
  return order.reduce((acc, code, i) => acc * placementOdd(groupId, code, i), 1);
}

/** Conjunto de grupos totalmente apurados dado o nº de jogos revelados. */
export function apuradoGroupSet(revealed: number): Set<string> {
  const set = new Set<string>();
  let count = 0;
  for (const g of GROUPS) {
    count += g.matches.length;
    if (revealed >= count) set.add(g.id);
  }
  return set;
}

/** Índice global (na sequência ALL_MATCHES) onde o grupo começa/termina. */
export function groupRange(groupId: string): { start: number; end: number } {
  let start = 0;
  for (const g of GROUPS) {
    if (g.id === groupId) return { start, end: start + g.matches.length };
    start += g.matches.length;
  }
  return { start: 0, end: 0 };
}

/** Classificados reais (top-2 de cada grupo), na ordem A1,A2,B1,B2,... */
export function qualifiers(): { group: string; pos: number; code: string }[] {
  const out: { group: string; pos: number; code: string }[] = [];
  for (const g of GROUPS) {
    for (let p = 0; p < QUALIFY_SLOTS; p++) {
      out.push({ group: g.id, pos: p + 1, code: g.actualOrder[p] });
    }
  }
  return out;
}

// ── Apuração da tabela (ordem prevista vs real) ────────────────
export type RowState = "correct" | "partial" | "incorrect" | "pending";

/**
 * Avalia a ordem prevista de um grupo contra a real.
 * - correct: posição exata certa
 * - partial: errou a posição mas acertou se classifica / é eliminado
 * - incorrect: errou o lado (previu classificar e foi eliminado, ou vice-versa)
 */
export function evaluateOrder(
  groupId: string,
  predicted: string[],
  apurado: boolean,
): { states: Record<string, RowState>; points: number; exact: number } {
  const g = getGroup(groupId)!;
  const states: Record<string, RowState> = {};
  let points = 0;
  let exact = 0;

  predicted.forEach((code, idx) => {
    if (!apurado) {
      states[code] = "pending";
      return;
    }
    const realIdx = g.actualOrder.indexOf(code);
    const predictedAdvances = idx < QUALIFY_SLOTS;
    const reallyAdvances = realIdx < QUALIFY_SLOTS;
    if (realIdx === idx) {
      states[code] = "correct";
      points += 10;
      exact++;
    } else if (predictedAdvances === reallyAdvances) {
      states[code] = "partial";
      points += 4;
    } else {
      states[code] = "incorrect";
    }
  });

  return { states, points, exact };
}
