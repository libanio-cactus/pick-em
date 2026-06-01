"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Page";
import { Card } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { StandingsTable } from "@/components/picks/StandingsTable";
import { GroupMatchesModal } from "@/components/picks/GroupMatchesModal";
import { Bracket } from "@/components/picks/Bracket";
import { PointsMeter } from "@/components/picks/PointsMeter";
import { StreakBadge, StreakLadder } from "@/components/picks/StreakBadge";
import { ArrowRight, CheckIcon, TrophyIcon } from "@/components/ui/icons";
import {
  GROUPS,
  TOTAL_MATCHES,
  apuradoGroupSet,
  groupRange,
  getGroup,
} from "@/data/groups";
import { bracketTally } from "@/data/bracket";
import {
  usePickEm,
  setPick,
  setOrder,
  setBracketPick,
  confirmPickem,
  confirmBracket,
  revealNext,
  revealNextGroup,
  setRevealed,
} from "@/lib/store";
import { tally, tablePoints, scorePickem } from "@/lib/scoring";
import { num } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function PalpitesPage() {
  const { picks, order, bracket, confirmed, bracketConfirmed, revealed } = usePickEm();
  const [tab, setTab] = useState<"grupos" | "elim">("grupos");
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const apuradoSet = apuradoGroupSet(revealed);
  const allApurado = revealed >= TOTAL_MATCHES;
  const t = tally(picks, revealed);
  const bt = bracketTally(bracket);
  const tablePts = tablePoints(order, apuradoSet);
  // pontos do bracket só entram depois de confirmar a etapa 2
  const score = scorePickem(
    { picks, order, bracket: bracketConfirmed ? bracket : {} },
    revealed,
  );

  const matchesFilled = Object.keys(picks).length;
  const canConfirm = matchesFilled >= 1;
  const canConfirmBracket = allApurado && bt.filled === bt.total;

  function matchesInGroup(gid: string) {
    return getGroup(gid)!.matches.filter((m) => picks[m.id]).length;
  }
  function revealedInGroup(gid: string) {
    const { start, end } = groupRange(gid);
    return Math.max(0, Math.min(end, revealed) - start);
  }
  function handleConfirm() {
    setSaving(true);
    setTimeout(() => {
      confirmPickem();
      setSaving(false);
    }, 700);
  }
  function handleConfirmBracket() {
    setSaving(true);
    setTimeout(() => {
      confirmBracket();
      setSaving(false);
    }, 700);
  }

  return (
    <Container>
      {/* KPIs após confirmar */}
      {confirmed && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Kpi label="Pontos totais" value={num(score.total)} tone="heat" />
          <Kpi label="Acertos (jogos)" value={`${t.correct}/${t.decided || 0}`} tone="success" />
          <Kpi label="Streak atual" value={`${t.currentStreak}`} sub={`melhor: ${t.bestStreak}`} tone="heat" />
          <Kpi label="Pontos tabela" value={num(tablePts)} sub="classificação" />
        </div>
      )}

      {/* Sub-abas + confirmar (alinhado à direita, na mesma linha) */}
      <div className="flex items-end justify-between gap-3 mb-5 border-b border-border">
        <div className="flex items-center gap-1">
          <SubTab active={tab === "grupos"} onClick={() => setTab("grupos")}>Fase de grupos</SubTab>
          <SubTab active={tab === "elim"} onClick={() => setTab("elim")} locked={!allApurado}>Eliminatórias</SubTab>
        </div>
        <div className="mb-1.5 shrink-0">
          {tab === "grupos" ? (
            confirmed ? (
              <ConfirmedBadge label="Etapa 1 confirmada" />
            ) : (
              <Button
                disabled={!canConfirm || saving}
                onClick={handleConfirm}
                title={!canConfirm ? "Defina ao menos 1 jogo nos grupos" : undefined}
              >
                {saving ? "Confirmando…" : (<><CheckIcon width={18} height={18} /> Confirmar fase de grupos</>)}
              </Button>
            )
          ) : !allApurado ? (
            <span className="inline-flex items-center gap-1.5 px-1 h-9 text-xs font-medium text-text-3">
              Libera após a fase de grupos
            </span>
          ) : bracketConfirmed ? (
            <ConfirmedBadge label="Etapa 2 confirmada" />
          ) : (
            <Button
              disabled={!canConfirmBracket || saving}
              onClick={handleConfirmBracket}
              title={!canConfirmBracket ? "Complete o bracket até o campeão" : undefined}
            >
              {saving ? "Confirmando…" : (<><CheckIcon width={18} height={18} /> Confirmar eliminatórias</>)}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        <div className="min-w-0">
          {tab === "grupos" ? (
            <>
              <p className="text-sm text-text-2 mb-3">
                Arraste para definir como cada grupo termina. Os{" "}
                <span className="text-brand font-semibold">2 primeiros</span> classificam.
                Cravar colocações difíceis (e zebras nos jogos) vale mais pontos.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {GROUPS.map((g) => (
                  <StandingsTable
                    key={g.id}
                    group={g}
                    order={order[g.id] ?? g.seed}
                    onReorder={allApurado ? undefined : (codes) => setOrder(g.id, codes)}
                    apurado={apuradoSet.has(g.id)}
                    matchesFilled={matchesInGroup(g.id)}
                    matchesTotal={g.matches.length}
                    onOpenMatches={() => setOpenGroup(g.id)}
                  />
                ))}
              </div>
            </>
          ) : allApurado ? (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrophyIcon width={18} height={18} className="text-heat" />
                <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-text">Mata-mata</h2>
                <span className="ml-auto text-xs text-text-3">
                  {bracketConfirmed
                    ? `${bt.correct}/${bt.total} acertos · ${num(bt.points)} pts`
                    : `${bt.filled}/${bt.total} chaves`}
                </span>
              </div>
              <p className="text-xs text-text-2 mb-4">
                {bracketConfirmed
                  ? "Pick'em das eliminatórias confirmado — veja os acertos abaixo."
                  : "Etapa 2: clique no time que avança em cada chave até cravar o campeão, depois confirme no topo."}
              </p>
              <Bracket
                picks={bracket}
                onPick={bracketConfirmed ? undefined : setBracketPick}
                apurado={bracketConfirmed}
              />
            </Card>
          ) : (
            <LockedElim revealed={revealed} />
          )}
        </div>

        {/* Painel lateral */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          {!confirmed ? (
            <>
              <PointsMeter picks={picks} orders={order} />

              <div className="rounded-card border border-border bg-surface p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2 mb-3">Bônus de streak</p>
                <StreakLadder bestStreak={matchesFilled} />
              </div>
              {matchesFilled === 0 && (
                <p className="text-center text-xs text-text-3">Defina ao menos 1 jogo (nos grupos) para confirmar.</p>
              )}
            </>
          ) : (
            <>
              <div className="rounded-card border border-heat/40 bg-gradient-to-br from-heat-soft to-transparent p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2">
                  {allApurado ? "Pontuação final" : "Pontuação parcial"}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-4xl font-extrabold text-heat tabular-nums">{num(score.total)}</span>
                  <span className="font-heading text-base font-bold text-heat">pts</span>
                </div>
                <p className="mt-1 text-xs text-text-2">
                  jogos {num(score.matchPts)} · tabela {num(score.tablePts)}
                  {allApurado && ` · mata-mata ${num(score.bracketPts)}`}
                </p>
              </div>

              <StreakBadge bestStreak={t.bestStreak} correct={t.correct} decided={t.decided} />

              <Card className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2 mb-1">Simulação de apuração</p>
                <p className="text-xs text-text-3 mb-3">
                  Resultados globais do torneio. Controle o ritmo — tabelas e streak reagem; eliminatórias liberam ao fim.
                </p>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full rounded-full bg-heat transition-all duration-500" style={{ width: `${(revealed / TOTAL_MATCHES) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-text-2 tabular-nums">{revealed}/{TOTAL_MATCHES}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button fullWidth variant="heat" onClick={revealNextGroup} disabled={allApurado}>
                    {allApurado ? "Fase encerrada" : "Apurar próximo grupo"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={revealNext} disabled={allApurado}>+1 jogo</Button>
                    <Button variant="ghost" onClick={() => setRevealed(0)}>Reiniciar</Button>
                  </div>
                  {!allApurado && <Button variant="ghost" onClick={() => setRevealed(TOTAL_MATCHES)}>Apurar tudo</Button>}
                </div>
              </Card>

              {allApurado && tab === "grupos" && (
                <Button variant="secondary" fullWidth onClick={() => setTab("elim")}>
                  Montar eliminatórias
                  <ArrowRight width={18} height={18} />
                </Button>
              )}
              <ButtonLink href="/ranking" size="lg" fullWidth>
                Ver ranking geral
                <ArrowRight width={18} height={18} />
              </ButtonLink>
            </>
          )}
        </aside>
      </div>

      <GroupMatchesModal
        group={openGroup ? getGroup(openGroup) ?? null : null}
        open={openGroup !== null}
        onClose={() => setOpenGroup(null)}
        picks={picks}
        onPick={setPick}
        revealedInGroup={openGroup ? revealedInGroup(openGroup) : 0}
      />
    </Container>
  );
}

function SubTab({ active, onClick, locked, children }: { active: boolean; onClick: () => void; locked?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("relative px-4 h-10 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors -mb-px", active ? "text-text" : "text-text-2 hover:text-text")}
    >
      {children}
      {locked && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-label="bloqueado">
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
      <span className={cn("absolute left-3 right-3 -bottom-px h-0.5 rounded-full", active ? "bg-brand" : "bg-transparent")} />
    </button>
  );
}

function LockedElim({ revealed }: { revealed: number }) {
  const rounds = ["Oitavas", "Quartas", "Semifinal", "Final", "Campeão"];
  const counts = [8, 4, 2, 1, 1];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-surface-2 text-text-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <div>
          <h2 className="font-heading text-sm font-bold text-text">Eliminatórias bloqueadas</h2>
          <p className="text-xs text-text-2">Liberam quando a fase de grupos for apurada ({revealed}/{TOTAL_MATCHES} jogos).</p>
        </div>
      </div>
      <div className="flex items-stretch gap-3 md:gap-5 overflow-x-auto opacity-60">
        {rounds.map((r, ri) => (
          <div key={r} className="flex flex-1 flex-col min-w-[140px]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-3 mb-2 text-center">{r}</p>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {Array.from({ length: counts[ri] }).map((_, i) =>
                r === "Campeão" ? (
                  <div key={i} className="rounded-card border border-dashed border-border bg-surface grid place-items-center py-6">
                    <span className="text-2xl opacity-40">🏆</span>
                    <span className="text-[11px] text-text-3 mt-1">A definir</span>
                  </div>
                ) : (
                  <div key={i} className="rounded-card border border-dashed border-border bg-surface overflow-hidden">
                    {["a", "b"].map((s) => (
                      <div key={s} className="flex items-center gap-2 px-2.5 h-11 border-b last:border-b-0 border-border">
                        <span className="h-5 w-5 rounded-full bg-surface-2" />
                        <span className="text-xs font-medium text-text-3">A definir</span>
                      </div>
                    ))}
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ConfirmedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-btn border border-success/40 bg-success-soft px-3 h-9 text-xs font-semibold text-success">
      <CheckIcon width={15} height={15} /> {label}
    </span>
  );
}

function Kpi({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "heat" | "success" }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-2">{label}</p>
      <p className={cn("font-heading text-2xl font-bold tabular-nums mt-0.5", tone === "heat" && "text-heat", tone === "success" && "text-success", tone === "default" && "text-text")}>{value}</p>
      {sub && <p className="text-xs text-text-3 -mt-0.5">{sub}</p>}
    </Card>
  );
}
