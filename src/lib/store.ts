"use client";

import { useEffect, useState } from "react";
import type { Member, OrderMap, PickOption, PicksMap } from "@/data/types";
import type { BracketPicks, TieId } from "@/data/bracket";
import { MEMBERS, SEED_ORDER, favoritePicks, FRIENDS_GROUP } from "@/data/friends";
import { TOTAL_MATCHES } from "@/data/groups";

// Module-level store (padrão Cactus). Estado = lista de pick'ems do usuário.
// Solo: ilimitados. Grupo: no máximo 1 (entrada do participante no ranking/pool).

export type PickEmScope = "solo" | "group";

export interface PickEm {
  id: string;
  name: string;
  scope: PickEmScope;
  picks: PicksMap; // palpites de jogos (V/E/D)
  order: OrderMap; // classificação prevista por grupo
  bracket: BracketPicks; // mata-mata
  stake: number;
  confirmed: boolean;
}

interface StoreState {
  pickems: PickEm[];
  /** Jogos já apurados na simulação (0..TOTAL_MATCHES) — global ao torneio. */
  revealed: number;
  // Grupo de amigos
  inGroup: boolean;
  groupName: string;
  inPool: boolean;
}

function freshOrder(): OrderMap {
  return Object.fromEntries(
    Object.entries(SEED_ORDER).map(([g, arr]) => [g, [...arr]]),
  );
}

let _uid = 1;
function newPickem(scope: PickEmScope, name?: string): PickEm {
  const id = `pe_${_uid++}`;
  return {
    id,
    name: name?.trim() || (scope === "group" ? "Pick'em do grupo" : "Meu pick'em"),
    scope,
    picks: {},
    order: freshOrder(),
    bracket: {},
    stake: 50,
    confirmed: false,
  };
}

const INITIAL: StoreState = {
  pickems: [],
  revealed: 0,
  inGroup: false,
  groupName: "",
  inPool: false,
};

const DEPENDENTS: Record<string, TieId[]> = {
  qf1: ["sf1", "fi"],
  qf2: ["sf1", "fi"],
  qf3: ["sf2", "fi"],
  qf4: ["sf2", "fi"],
  sf1: ["fi"],
  sf2: ["fi"],
};

let _state: StoreState = { ...INITIAL };
const _subs = new Set<() => void>();

function _notify() {
  _subs.forEach((fn) => fn());
}
function _set(patch: Partial<StoreState>) {
  _state = { ..._state, ...patch };
  _notify();
}
function _updatePickem(id: string, fn: (p: PickEm) => PickEm) {
  _set({ pickems: _state.pickems.map((p) => (p.id === id ? fn(p) : p)) });
}

// ── Pick'ems: ciclo de vida ────────────────────────────────────
export function createPickem(scope: PickEmScope = "solo", name?: string): string {
  const pe = newPickem(scope, name);
  _set({ pickems: [..._state.pickems, pe] });
  return pe.id;
}

export function deletePickem(id: string) {
  _set({ pickems: _state.pickems.filter((p) => p.id !== id) });
}

export function confirmPickem(id: string) {
  _updatePickem(id, (p) => ({ ...p, confirmed: true }));
}

/** Garante e devolve o id do pick'em do grupo (cria se não existir). */
export function ensureGroupPickem(): string {
  const existing = _state.pickems.find((p) => p.scope === "group");
  if (existing) return existing.id;
  const pe = newPickem("group", `Pick'em · ${_state.groupName || FRIENDS_GROUP.name}`);
  _set({ pickems: [..._state.pickems, pe] });
  return pe.id;
}

// ── Pick'ems: edição (por id) ──────────────────────────────────
export function setPick(id: string, matchId: string, pick: PickOption) {
  _updatePickem(id, (p) => {
    const picks = { ...p.picks };
    if (picks[matchId] === pick) delete picks[matchId];
    else picks[matchId] = pick;
    return { ...p, picks };
  });
}

export function setOrder(id: string, groupId: string, codes: string[]) {
  _updatePickem(id, (p) => ({ ...p, order: { ...p.order, [groupId]: codes } }));
}

export function setStake(id: string, stake: number) {
  _updatePickem(id, (p) => ({ ...p, stake: Math.max(0, stake) }));
}

export function setBracketPick(id: string, tie: TieId, teamCode: string) {
  _updatePickem(id, (p) => {
    const bracket: BracketPicks = { ...p.bracket };
    if (bracket[tie] === teamCode) delete bracket[tie];
    else bracket[tie] = teamCode;
    for (const dep of DEPENDENTS[tie] ?? []) {
      if (bracket[dep] && !valueStillReachable(bracket, dep)) delete bracket[dep];
    }
    return { ...p, bracket };
  });
}

function valueStillReachable(bracket: BracketPicks, tie: TieId): boolean {
  const sources: Record<string, [TieId, TieId]> = {
    sf1: ["qf1", "qf2"],
    sf2: ["qf3", "qf4"],
    fi: ["sf1", "sf2"],
  };
  const picked = bracket[tie];
  const src = sources[tie];
  if (!picked || !src) return true;
  return src.some((s) => bracket[s] === picked);
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

// ── Grupo de amigos ────────────────────────────────────────────
export function createGroup(name: string) {
  _set({ inGroup: true, groupName: name.trim() || FRIENDS_GROUP.name });
}
export function joinGroup(codeOrLink: string) {
  void codeOrLink; // no protótipo qualquer código entra no grupo demo
  _set({ inGroup: true, groupName: FRIENDS_GROUP.name });
}
export function leaveGroup() {
  _set({
    inGroup: false,
    groupName: "",
    inPool: false,
    pickems: _state.pickems.filter((p) => p.scope !== "group"),
  });
}
export function joinPool() {
  _set({ inPool: true });
}

// ── Leitura ────────────────────────────────────────────────────
export function getState(): StoreState {
  return _state;
}

/** Pick'em que representa "Você" no ranking: o do grupo (se houver) ou o solo mais recente. */
export function representativePickem(s: StoreState): PickEm | undefined {
  return (
    s.pickems.find((p) => p.scope === "group") ??
    [...s.pickems].reverse().find((p) => p.scope === "solo")
  );
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

/** Metadados globais (compat com chamadas existentes). */
export function usePickEm() {
  return useStore();
}

export function usePickems(): PickEm[] {
  return useStore().pickems;
}

export function usePickemById(id: string | null | undefined): PickEm | undefined {
  const s = useStore();
  return id ? s.pickems.find((p) => p.id === id) : undefined;
}

export function useGroupPickem(): PickEm | undefined {
  return useStore().pickems.find((p) => p.scope === "group");
}

/** Membros do grupo com "Você" refletindo o pick'em representativo. */
export function useMembers(): Member[] {
  const s = useStore();
  const rep = representativePickem(s);
  return MEMBERS.map((m) =>
    m.isCurrentUser
      ? {
          ...m,
          picks: rep && Object.keys(rep.picks).length > 0 ? rep.picks : favoritePicks(),
          order: rep ? rep.order : SEED_ORDER,
          inPool: s.inPool,
        }
      : m,
  );
}
