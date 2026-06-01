import type { BracketPicks, Member, OrderMap, PickOption, PicksMap, Standing } from "./types";
import { ALL_MATCHES, GROUPS } from "./groups";
import { TIE_DEFS, ACTUAL_BRACKET, tieSides } from "./bracket";
import { scorePickem } from "@/lib/scoring";

export const FRIENDS_GROUP = {
  id: "g_amigos2026",
  name: "Resenha da Copa ⚽",
  inviteCode: "COPA-7K-4F2A",
  inviteLink: "https://7k.bet/pickem/g/COPA-7K-4F2A",
  houseMarginPct: 0.08,
};

/** Cota padrão do grupo demo (entrar por código). */
export const DEMO_COTA = 50;
/** Presets de cota oferecidos ao dono na criação do grupo. */
export const COTA_PRESETS = [10, 25, 50, 100];

// ── Defaults do usuário ────────────────────────────────────────
/** Palpite padrão = favorito de cada jogo (menor odd). */
export function favoritePicks(): PicksMap {
  const map: PicksMap = {};
  for (const m of ALL_MATCHES) {
    map[m.id] = m.odds.a <= m.odds.b ? "a" : "b";
  }
  return map;
}

/** Ordem inicial da tabela = ordem de seed (força) de cada grupo. */
export const SEED_ORDER: OrderMap = Object.fromEntries(
  GROUPS.map((g) => [g.id, [...g.seed]]),
);

// ── PRNG determinístico (para gerar palpites dos amigos) ───────
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function genPicks(memberId: string, skill: number): PicksMap {
  const r = mulberry32(hashStr(memberId + "-picks"));
  const map: PicksMap = {};
  for (const m of ALL_MATCHES) {
    if (r() < skill) {
      map[m.id] = m.result; // acerta
    } else {
      const others = (["a", "draw", "b"] as PickOption[]).filter(
        (o) => o !== m.result,
      );
      map[m.id] = others[Math.floor(r() * others.length)];
    }
  }
  return map;
}

function genOrder(memberId: string, skill: number): OrderMap {
  const r = mulberry32(hashStr(memberId + "-order"));
  const orders: OrderMap = {};
  for (const g of GROUPS) {
    const arr = [...g.actualOrder];
    const swaps = Math.round((1 - skill) * 3);
    for (let k = 0; k < swaps; k++) {
      const i = Math.floor(r() * 4);
      const j = Math.floor(r() * 4);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    orders[g.id] = arr;
  }
  return orders;
}

function genBracket(memberId: string, skill: number): BracketPicks {
  const r = mulberry32(hashStr(memberId + "-bracket"));
  const b: BracketPicks = {};
  // TIE_DEFS está em ordem (oitavas → final), então cada chave já tem os lados prontos.
  for (const def of TIE_DEFS) {
    const opts = tieSides(def.tie, b).filter((o): o is string => !!o);
    if (!opts.length) continue;
    const real = ACTUAL_BRACKET[def.tie];
    b[def.tie] = r() < skill && opts.includes(real) ? real : opts[Math.floor(r() * opts.length)];
  }
  return b;
}

/** Predições determinísticas de um jogador (para amigos e comunidade). */
export function genPredictions(seed: string, skill: number) {
  return {
    picks: genPicks(seed, skill),
    order: genOrder(seed, skill),
    bracket: genBracket(seed, skill),
  };
}

interface MemberSeed {
  id: string;
  name: string;
  avatar: string;
  skill: number;
  isCurrentUser?: boolean;
  inPool: boolean;
}

const SEEDS: MemberSeed[] = [
  { id: "u_marina", name: "Marina Alves", avatar: "🦊", skill: 0.82, inPool: true },
  { id: "u_diego", name: "Diego Castro", avatar: "🐺", skill: 0.66, inPool: true },
  { id: "u_you", name: "Você", avatar: "⭐", skill: 0.6, isCurrentUser: true, inPool: false },
  { id: "u_bia", name: "Bia Nunes", avatar: "🐝", skill: 0.54, inPool: true },
  { id: "u_teo", name: "Téo Ramos", avatar: "🦅", skill: 0.42, inPool: false },
];

function toMember(s: MemberSeed): Member {
  return {
    id: s.id,
    name: s.name,
    avatar: s.avatar,
    isCurrentUser: s.isCurrentUser,
    inPool: s.inPool,
    picks: s.isCurrentUser ? favoritePicks() : genPicks(s.id, s.skill),
    order: s.isCurrentUser ? SEED_ORDER : genOrder(s.id, s.skill),
    bracket: s.isCurrentUser ? {} : genBracket(s.id, s.skill),
  };
}

/** Você (base, sem pick'em do store — o store injeta via useGroupMembers). */
export const YOU_BASE: Member = toMember(SEEDS.find((s) => s.isCurrentUser)!);
/** Pool de amigos mockados (4). */
export const FRIENDS: Member[] = SEEDS.filter((s) => !s.isCurrentUser).map(toMember);
/** Roster completo (compat). */
export const MEMBERS: Member[] = [YOU_BASE, ...FRIENDS];

/** Roster de um grupo: demo = todos; grupos criados = você + subconjunto seeded. */
export function rosterFor(groupId: string): Member[] {
  if (groupId === FRIENDS_GROUP.id) return MEMBERS;
  const r = mulberry32(hashStr(groupId));
  const shuffled = [...FRIENDS].sort(() => r() - 0.5);
  const n = 2 + Math.floor(r() * 2); // 2–3 amigos
  return [YOU_BASE, ...shuffled.slice(0, n)];
}

// ── Ranking (jogos + tabela + bracket, por pontos) ─────────────
export function standings(members: Member[], revealed: number): Standing[] {
  const rows: Standing[] = members.map((member) => {
    const sc = scorePickem(member, revealed);
    return {
      member,
      matchPts: sc.matchPts,
      tablePts: sc.tablePts,
      bracketPts: sc.bracketPts,
      points: sc.total,
      correct: sc.correct,
      decided: sc.decided,
      accuracy: sc.decided > 0 ? sc.correct / sc.decided : 0,
      bestStreak: sc.bestStreak,
      position: 0,
    };
  });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
    return b.correct - a.correct;
  });
  rows.forEach((r, i) => (r.position = i + 1));
  return rows;
}

export function poolSummary(members: Member[], cota: number) {
  const participants = members.filter((m) => m.inPool);
  const total = participants.length * cota;
  const prize = total * (1 - FRIENDS_GROUP.houseMarginPct);
  return {
    participants,
    count: participants.length,
    total,
    prize,
    margin: total * FRIENDS_GROUP.houseMarginPct,
  };
}
