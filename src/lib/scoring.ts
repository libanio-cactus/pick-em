import {
  ALL_MATCHES as MATCHES,
  TOTAL_MATCHES,
  GROUPS,
  evaluateOrder,
  orderPotentialPoints,
  apuradoGroupSet,
  pointsFromOdd,
} from "@/data/groups";
import { bracketTally, type BracketPicks } from "@/data/bracket";
import type { Match, PicksMap, PickOption, OrderMap } from "@/data/types";

// ════════════ Modelo 4fun: PONTOS por dificuldade (sem dinheiro) ════════════
// Cada acerto vale pontos proporcionais à dificuldade (a odd é só o peso):
// favorito vale pouco, zebra vale muito. Streak multiplica os pontos dos jogos.

/** Pontos de um acerto de jogo, ponderado pela dificuldade (odd). */
export const matchPoints = pointsFromOdd;

// ── Streak (bônus de pontos) ───────────────────────────────────
export const STREAK_TIERS = [
  { min: 3, bonus: 0.2, label: "3 seguidos" },
  { min: 5, bonus: 0.5, label: "5 seguidos" },
  { min: 8, bonus: 1.0, label: "8 seguidos" },
] as const;

export const FULL_PHASE_BONUS = 2.0;
export const FULL_PHASE_LABEL = "Fase inteira";

export function streakBonus(bestStreak: number, correct: number, decided: number): number {
  if (decided === TOTAL_MATCHES && correct === TOTAL_MATCHES) return FULL_PHASE_BONUS;
  let bonus = 0;
  for (const tier of STREAK_TIERS) if (bestStreak >= tier.min) bonus = tier.bonus;
  return bonus;
}

export function streakTierLabel(bestStreak: number, correct: number, decided: number): string | null {
  if (decided === TOTAL_MATCHES && correct === TOTAL_MATCHES) return FULL_PHASE_LABEL;
  let label: string | null = null;
  for (const tier of STREAK_TIERS) if (bestStreak >= tier.min) label = tier.label;
  return label;
}

/** Bônus de streak projetado se acertar os N jogos palpitados. */
export function projectedBonusFor(count: number): number {
  if (count === TOTAL_MATCHES) return FULL_PHASE_BONUS;
  let bonus = 0;
  for (const tier of STREAK_TIERS) if (count >= tier.min) bonus = tier.bonus;
  return bonus;
}

// ── Pontos da camada de tabela ─────────────────────────────────
export function tablePoints(orders: OrderMap, apuradoGroups: Set<string>): number {
  return GROUPS.reduce((acc, g) => {
    const predicted = orders[g.id] ?? g.seed;
    const { points } = evaluateOrder(g.id, predicted, apuradoGroups.has(g.id));
    return acc + points;
  }, 0);
}

/** Pontos de tabela projetados (se cravar a ordem exata de todos os grupos). */
export function projectedTablePoints(orders: OrderMap): number {
  return GROUPS.reduce(
    (acc, g) => acc + orderPotentialPoints(g.id, orders[g.id] ?? g.seed),
    0,
  );
}

// ── Pontos potenciais dos jogos (antes da apuração) ────────────
/** Soma bruta dos pontos dos jogos palpitados (sem streak). */
export function rawMatchPoints(picks: PicksMap): number {
  return MATCHES.reduce(
    (acc, m) => (picks[m.id] ? acc + matchPoints(m.odds[picks[m.id]]) : acc),
    0,
  );
}

/** Pontos de jogos projetados: acertando tudo + bônus de streak máximo possível. */
export function projectedMatchPoints(picks: PicksMap): number {
  const count = Object.keys(picks).length;
  return Math.round(rawMatchPoints(picks) * (1 + projectedBonusFor(count)));
}

// ── Apuração (resultado real vs picks) ─────────────────────────
export interface Tally {
  correct: number;
  wrong: number;
  decided: number;
  bestStreak: number;
  currentStreak: number;
  points: number; // pontos de jogos (com bônus de streak)
  perMatch: { match: Match; pick: PickOption | null; correct: boolean | null }[];
}

export function tally(picks: PicksMap, revealed: number): Tally {
  let correct = 0;
  let wrong = 0;
  let decided = 0;
  let points = 0;
  let cur = 0;
  let best = 0;

  const perMatch = MATCHES.map((m, i) => {
    const pick = picks[m.id] ?? null;
    if (i >= revealed) return { match: m, pick, correct: null as boolean | null };
    if (pick == null) {
      cur = 0;
      return { match: m, pick, correct: null as boolean | null };
    }
    decided++;
    const ok = pick === m.result;
    if (ok) {
      correct++;
      cur++;
      best = Math.max(best, cur);
      points += matchPoints(m.odds[pick]);
    } else {
      wrong++;
      cur = 0;
    }
    return { match: m, pick, correct: ok };
  });

  const bonus = streakBonus(best, correct, decided);
  points = Math.round(points * (1 + bonus));

  return { correct, wrong, decided, bestStreak: best, currentStreak: cur, points, perMatch };
}

// ── Placar total de um pick'em (jogos + tabela + bracket) ───────
export interface PickemScore {
  matchPts: number;
  tablePts: number;
  bracketPts: number;
  total: number;
  correct: number;
  decided: number;
  bestStreak: number;
}

export function scorePickem(
  pe: { picks: PicksMap; order: OrderMap; bracket: BracketPicks },
  revealed: number,
): PickemScore {
  const apur = apuradoGroupSet(revealed);
  const t = tally(pe.picks, revealed);
  const tablePts = tablePoints(pe.order, apur);
  const bracketPts = revealed >= TOTAL_MATCHES ? bracketTally(pe.bracket).points : 0;
  return {
    matchPts: t.points,
    tablePts,
    bracketPts,
    total: t.points + tablePts + bracketPts,
    correct: t.correct,
    decided: t.decided,
    bestStreak: t.bestStreak,
  };
}
