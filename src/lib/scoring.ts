import {
  ALL_MATCHES as MATCHES,
  TOTAL_MATCHES,
  GROUPS,
  evaluateOrder,
  orderOdd,
} from "@/data/groups";
import type { Match, PicksMap, PickOption, OrderMap } from "@/data/types";

/** Pontos da camada de tabela (classificação prevista) somando os 4 grupos. */
export function tablePoints(orders: OrderMap, apuradoGroups: Set<string>): number {
  return GROUPS.reduce((acc, g) => {
    const predicted = orders[g.id] ?? g.seed;
    const { points } = evaluateOrder(g.id, predicted, apuradoGroups.has(g.id));
    return acc + points;
  }, 0);
}

// ── Camada de aposta da tabela (ordem exata paga a odd da ordem) ──
function isExactOrder(groupId: string, predicted: string[]): boolean {
  const g = GROUPS.find((x) => x.id === groupId)!;
  return predicted.length === g.actualOrder.length &&
    predicted.every((c, i) => c === g.actualOrder[i]);
}

/** Retorno projetado da tabela: aposta × odd da ordem de cada grupo (se cravar). */
export function projectedTableReturn(stake: number, orders: OrderMap): number {
  return GROUPS.reduce((acc, g) => {
    const predicted = orders[g.id] ?? g.seed;
    return acc + stake * orderOdd(g.id, predicted);
  }, 0);
}

/** Retorno apurado da tabela: paga só os grupos cuja ordem exata foi cravada. */
export function tableReturn(
  stake: number,
  orders: OrderMap,
  apuradoGroups: Set<string>,
): number {
  return GROUPS.reduce((acc, g) => {
    const predicted = orders[g.id] ?? g.seed;
    if (!apuradoGroups.has(g.id)) return acc;
    return isExactOrder(g.id, predicted)
      ? acc + stake * orderOdd(g.id, predicted)
      : acc;
  }, 0);
}

// ── Streak / bônus ─────────────────────────────────────────────
// Tiers de acertos consecutivos dentro da fase.
export const STREAK_TIERS = [
  { min: 3, bonus: 0.2, label: "3 seguidos" },
  { min: 5, bonus: 0.5, label: "5 seguidos" },
  { min: 8, bonus: 1.0, label: "8 seguidos" },
] as const;

export const FULL_PHASE_BONUS = 2.0; // fase inteira certa
export const FULL_PHASE_LABEL = "Fase inteira";

/** Multiplicador de bônus (0 = sem bônus) dado o streak e o aproveitamento. */
export function streakBonus(
  bestStreak: number,
  correct: number,
  decided: number,
): number {
  // Fase inteira certa só conta quando todos os jogos foram apurados e acertados.
  if (decided === TOTAL_MATCHES && correct === TOTAL_MATCHES) {
    return FULL_PHASE_BONUS;
  }
  let bonus = 0;
  for (const tier of STREAK_TIERS) {
    if (bestStreak >= tier.min) bonus = tier.bonus;
  }
  return bonus;
}

/** Rótulo do tier atingido, para badge. */
export function streakTierLabel(
  bestStreak: number,
  correct: number,
  decided: number,
): string | null {
  if (decided === TOTAL_MATCHES && correct === TOTAL_MATCHES) {
    return FULL_PHASE_LABEL;
  }
  let label: string | null = null;
  for (const tier of STREAK_TIERS) {
    if (bestStreak >= tier.min) label = tier.label;
  }
  return label;
}

// ── Retorno potencial (antes da apuração) ──────────────────────
/** Produto das odds dos picks selecionados. */
export function oddsMultiplier(picks: PicksMap): number {
  return MATCHES.reduce((acc, m) => {
    const pick = picks[m.id];
    return pick ? acc * m.odds[pick] : acc;
  }, 1);
}

/** Retorno base = aposta × produto das odds. */
export function baseReturn(stake: number, picks: PicksMap): number {
  return stake * oddsMultiplier(picks);
}

/** Projeção do retorno máximo: assume todos os picks certos (fase inteira → +200%). */
export function maxProjectedReturn(stake: number, picks: PicksMap): number {
  const count = Object.keys(picks).length;
  const bonus = count === TOTAL_MATCHES ? FULL_PHASE_BONUS : projectedBonusFor(count);
  return baseReturn(stake, picks) * (1 + bonus);
}

/** Bônus projetado se o usuário acertar todos os N picks que fez. */
export function projectedBonusFor(count: number): number {
  if (count === TOTAL_MATCHES) return FULL_PHASE_BONUS;
  let bonus = 0;
  for (const tier of STREAK_TIERS) {
    if (count >= tier.min) bonus = tier.bonus;
  }
  return bonus;
}

// ── Apuração (resultado real vs picks) ─────────────────────────
export interface Tally {
  correct: number;
  wrong: number;
  decided: number; // jogos apurados que o usuário palpitou
  bestStreak: number;
  currentStreak: number;
  points: number; // acertos ponderados por odds
  /** Estado por jogo apurado: acertou ou não (na ordem de MATCHES). */
  perMatch: { match: Match; pick: PickOption | null; correct: boolean | null }[];
}

/**
 * Apura os picks contra os `revealed` primeiros jogos (na ordem de MATCHES).
 * `revealed` = quantos jogos já "aconteceram" na simulação.
 */
export function tally(picks: PicksMap, revealed: number): Tally {
  let correct = 0;
  let wrong = 0;
  let decided = 0;
  let points = 0;
  let cur = 0;
  let best = 0;

  const perMatch = MATCHES.map((m, i) => {
    const pick = picks[m.id] ?? null;
    if (i >= revealed) {
      return { match: m, pick, correct: null as boolean | null };
    }
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
      points += m.odds[pick] * 10; // ponderado pelas odds
    } else {
      wrong++;
      cur = 0;
    }
    return { match: m, pick, correct: ok };
  });

  // bônus de streak entra como peso extra na pontuação do ranking
  const bonus = streakBonus(best, correct, decided);
  points = Math.round(points * (1 + bonus));

  return {
    correct,
    wrong,
    decided,
    bestStreak: best,
    currentStreak: cur,
    points,
    perMatch,
  };
}

/** Retorno final após apuração: aposta × odds dos acertos × (1 + bônus de streak). */
export function finalReturn(
  stake: number,
  picks: PicksMap,
  revealed: number,
): number {
  const t = tally(picks, revealed);
  let mult = 1;
  MATCHES.forEach((m, i) => {
    if (i < revealed && picks[m.id] === m.result) mult *= m.odds[m.result];
  });
  const bonus = streakBonus(t.bestStreak, t.correct, t.decided);
  return stake * mult * (1 + bonus);
}
