"use client";

import { useEffect, useState } from "react";
import type { Member, OrderMap, PickOption, PicksMap } from "@/data/types";
import type { TieId, BracketPicks } from "@/data/bracket";
import { applyBracketPick } from "@/data/bracket";
import {
  SEED_ORDER,
  favoritePicks,
  FRIENDS_GROUP,
  DEMO_COTA,
  rosterFor,
} from "@/data/friends";
import { TOTAL_MATCHES } from "@/data/groups";

// Module-level store (padrão Cactus). 4fun: 1 pick'em por pessoa.
// O jogador pode estar em VÁRIOS grupos; cada grupo tem seu bolão (cota própria).

export interface UserGroup {
  id: string;
  name: string;
  cota: number; // valor da cota do bolão (definido pelo dono)
  inBolao: boolean; // o usuário entrou no bolão deste grupo?
}

interface StoreState {
  picks: PicksMap;
  order: OrderMap;
  bracket: BracketPicks;
  confirmed: boolean; // etapa 1: pick'em da fase de grupos
  bracketConfirmed: boolean; // etapa 2: pick'em das eliminatórias
  revealed: number; // jogos apurados (global ao torneio)
  groups: UserGroup[]; // grupos em que o usuário está
}

function freshOrder(): OrderMap {
  return Object.fromEntries(
    Object.entries(SEED_ORDER).map(([g, arr]) => [g, [...arr]]),
  );
}

const INITIAL: StoreState = {
  picks: {},
  order: freshOrder(),
  bracket: {},
  confirmed: false,
  bracketConfirmed: false,
  revealed: 0,
  groups: [],
};

let _state: StoreState = { ...INITIAL };
let _gid = 1;
const _subs = new Set<() => void>();

function _notify() {
  _subs.forEach((fn) => fn());
}
function _set(patch: Partial<StoreState>) {
  _state = { ..._state, ...patch };
  _notify();
}

// ── Pick'em (edição) ───────────────────────────────────────────
export function setPick(matchId: string, pick: PickOption) {
  const picks = { ..._state.picks };
  if (picks[matchId] === pick) delete picks[matchId];
  else picks[matchId] = pick;
  _set({ picks });
}

export function setOrder(groupId: string, codes: string[]) {
  _set({ order: { ..._state.order, [groupId]: codes } });
}

export function setBracketPick(tie: TieId, teamCode: string) {
  _set({ bracket: applyBracketPick(_state.bracket, tie, teamCode) });
}

export function confirmPickem() {
  _set({ confirmed: true });
}
export function confirmBracket() {
  _set({ bracketConfirmed: true });
}
export function resetPickem() {
  _set({
    picks: {},
    order: freshOrder(),
    bracket: {},
    confirmed: false,
    bracketConfirmed: false,
  });
}

// ── Simulação (global) ─────────────────────────────────────────
export function setRevealed(n: number) {
  _set({ revealed: Math.max(0, Math.min(TOTAL_MATCHES, n)) });
}
export function revealNext() {
  setRevealed(_state.revealed + 1);
}
export function revealNextGroup() {
  setRevealed((Math.floor(_state.revealed / 6) + 1) * 6);
}

// ── Grupos (multi) + bolão ─────────────────────────────────────
/** Cria um grupo (o usuário vira dono e define a cota). Retorna o id. */
export function createGroup(name: string, cota: number): string {
  const id = `g_${_gid++}`;
  const group: UserGroup = {
    id,
    name: name.trim() || "Meu grupo",
    cota: Math.max(0, cota),
    inBolao: false,
  };
  _set({ groups: [..._state.groups, group] });
  return id;
}

/** Entra via código/link — no protótipo cai no grupo demo. Retorna o id. */
export function joinGroup(codeOrLink: string): string {
  void codeOrLink;
  const existing = _state.groups.find((g) => g.id === FRIENDS_GROUP.id);
  if (existing) return existing.id;
  const group: UserGroup = {
    id: FRIENDS_GROUP.id,
    name: FRIENDS_GROUP.name,
    cota: DEMO_COTA,
    inBolao: false,
  };
  _set({ groups: [..._state.groups, group] });
  return group.id;
}

export function leaveGroup(id: string) {
  _set({ groups: _state.groups.filter((g) => g.id !== id) });
}

export function joinBolao(id: string) {
  _set({
    groups: _state.groups.map((g) => (g.id === id ? { ...g, inBolao: true } : g)),
  });
}

// ── Leitura ────────────────────────────────────────────────────
export function getState(): StoreState {
  return _state;
}

function useStore(): StoreState {
  const [s, setS] = useState<StoreState>(getState);
  useEffect(() => {
    const handler = () => setS(getState());
    _subs.add(handler);
    handler();
    return () => {
      _subs.delete(handler);
    };
  }, []);
  return s;
}

export function usePickEm(): StoreState {
  return useStore();
}

export function useGroups(): UserGroup[] {
  return useStore().groups;
}

export function useGroup(id: string | null | undefined): UserGroup | undefined {
  const s = useStore();
  return id ? s.groups.find((g) => g.id === id) : undefined;
}

/** Roster de um grupo com "Você" refletindo o pick'em do usuário + bolão do grupo. */
export function useGroupMembers(groupId: string): Member[] {
  const s = useStore();
  const g = s.groups.find((x) => x.id === groupId);
  const hasPicks = Object.keys(s.picks).length > 0;
  return rosterFor(groupId).map((m) =>
    m.isCurrentUser
      ? {
          ...m,
          picks: hasPicks ? s.picks : favoritePicks(),
          order: s.order,
          bracket: s.bracketConfirmed ? s.bracket : {},
          inPool: g?.inBolao ?? false,
        }
      : m,
  );
}
