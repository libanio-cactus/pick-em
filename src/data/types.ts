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

export interface Member {
  id: string;
  name: string;
  avatar: string; // emoji
  isCurrentUser?: boolean;
  picks: PicksMap; // palpites de jogos (V/E/D)
  order: OrderMap; // classificação prevista por grupo
  inPool: boolean;
}

export interface Standing {
  member: Member;
  points: number; // total (tabela + jogos)
  matchPts: number; // pontos da acumuladora de jogos
  tablePts: number; // pontos de classificação (tabela)
  correct: number;
  decided: number; // jogos já apurados
  accuracy: number; // 0..1 sobre os jogos apurados
  bestStreak: number;
  position: number;
}
