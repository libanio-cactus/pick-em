// Tipos de domínio do Pick'Em Copa 2026 (tudo mockado, sem backend)

export type PickOption = "a" | "draw" | "b";

export type MatchStatus = "upcoming" | "live" | "finished";

export interface Team {
  code: string; // sigla FIFA, ex: "BRA"
  name: string; // nome em PT-BR
  flag: string; // emoji da bandeira
}

export interface Match {
  id: string;
  group: string; // grupo da Copa, ex: "A"
  teamA: Team;
  teamB: Team;
  kickoff: string; // label legível, ex: "Hoje · 16h"
  odds: { a: number; draw: number; b: number };
  /** Resultado pré-determinado para a simulação de apuração. */
  result: PickOption;
}

export type PicksMap = Record<string, PickOption>; // matchId -> escolha
export type OrderMap = Record<string, string[]>; // groupId -> ordem prevista (codes)

export type TieId =
  | "o1" | "o2" | "o3" | "o4" | "o5" | "o6" | "o7" | "o8" // oitavas
  | "q1" | "q2" | "q3" | "q4" // quartas
  | "s1" | "s2" // semis
  | "fi"; // final
export type BracketPicks = Partial<Record<TieId, string>>; // tie -> teamCode

export interface Member {
  id: string;
  name: string;
  avatar: string; // emoji
  isCurrentUser?: boolean;
  picks: PicksMap; // palpites de jogos (V/E/D)
  order: OrderMap; // classificação prevista por grupo
  bracket: BracketPicks; // mata-mata
  inPool: boolean;
}

export interface Standing {
  member: Member;
  points: number; // total (jogos + tabela + bracket)
  matchPts: number; // pontos dos jogos (com streak)
  tablePts: number; // pontos de classificação (tabela)
  bracketPts: number; // pontos do mata-mata
  correct: number;
  decided: number; // jogos já apurados
  accuracy: number; // 0..1 sobre os jogos apurados
  bestStreak: number;
  position: number;
}
