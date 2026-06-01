"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Page";
import { Card } from "@/components/ui/Card";
import { ArrowRight, BallIcon, TrophyIcon, UsersIcon } from "@/components/ui/icons";
import { ALL_MATCHES, TOTAL_MATCHES } from "@/data/groups";
import { ALL_TIES, bracketTally } from "@/data/bracket";
import { globalStandings, HOUSE_PRIZES } from "@/data/community";
import { usePickEm, useGroups } from "@/lib/store";
import { scorePickem } from "@/lib/scoring";
import { money, num } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function OverviewPage() {
  const { picks, order, bracket, bracketConfirmed, revealed } = usePickEm();
  const groups = useGroups();
  const score = scorePickem(
    { picks, order, bracket: bracketConfirmed ? bracket : {} },
    revealed,
  );
  const global = globalStandings(score.total, revealed);

  const bt = bracketTally(bracket);
  const allApurado = revealed >= TOTAL_MATCHES;
  const matchesFilled = ALL_MATCHES.filter((m) => picks[m.id]).length;
  const started = matchesFilled > 0;
  const globalPct = Math.round((global.you.position / global.total) * 100);

  return (
    <Container>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <div className="flex flex-col gap-6">
          {/* Hero */}
          <Card className="relative overflow-hidden p-6 md:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-heat/10 blur-3xl" />
            <div className="relative max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-base px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
                🏆 Pick&apos;Em 4fun · Copa 2026
              </span>
              <h2 className="mt-3 font-heading text-3xl md:text-4xl font-extrabold leading-[1.08] tracking-tight text-text">
                Monte a tabela. <span className="text-brand">Crave os jogos.</span>{" "}
                <span className="text-heat">Suba no ranking.</span>
              </h2>
              <p className="mt-3 text-sm text-text-2">
                É de graça e por diversão: você pontua acertando a classificação e
                os jogos — e a 7K premia o topo do ranking geral.
              </p>
            </div>

            <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
              <PathCard
                href="/palpites"
                icon={BallIcon}
                title={started ? "Continuar meu pick'em" : "Montar meu pick'em"}
                desc="Arraste a tabela e palpite os jogos. Grátis, vale pontos."
                cta={started ? "Continuar" : "Começar"}
                primary
              />
              <PathCard
                href="/grupo"
                icon={UsersIcon}
                title="Jogar com amigos"
                desc="Crie um grupo, dispute o ranking e entre no bolão."
                cta="Criar grupo"
              />
            </div>
          </Card>

          {/* Prêmio da casa */}
          <Link
            href="/ranking"
            className="group rounded-card border border-heat/40 bg-gradient-to-br from-heat-soft to-transparent p-5 flex items-center gap-4 transition-colors hover:border-heat/70"
          >
            <span className="grid place-items-center h-12 w-12 rounded-card bg-heat/20 text-heat shrink-0">
              <TrophyIcon width={24} height={24} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-base font-bold text-text">
                A 7K premia o Top 3 do ranking geral
              </p>
              <p className="text-sm text-text-2">
                {money(HOUSE_PRIZES[0])} · {money(HOUSE_PRIZES[1])} ·{" "}
                {money(HOUSE_PRIZES[2])} para os melhores da temporada.
              </p>
            </div>
            <ArrowRight className="text-heat shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Status das seções */}
          <div>
            <h3 className="font-heading text-base font-bold text-text mb-3">
              Suas seções de palpite
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <PickSection
                icon={BallIcon}
                title="Fase de grupos"
                status={allApurado ? "Encerrada" : "Aberta"}
                tone={allApurado ? "muted" : "open"}
                filled={matchesFilled}
                total={TOTAL_MATCHES}
                hint="4 tabelas + 24 jogos · arraste e palpite"
              />
              <PickSection
                icon={TrophyIcon}
                title="Eliminatórias"
                status={allApurado ? "Liberada" : "Bloqueada"}
                tone={allApurado ? "open" : "locked"}
                filled={bt.filled}
                total={ALL_TIES.length}
                hint={allApurado ? "Monte o bracket até o campeão" : "Libera após a fase de grupos"}
              />
            </div>
          </div>

          {/* Como pontua */}
          <Card className="p-6">
            <h3 className="font-heading text-base font-bold text-text mb-4">Como pontua</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <HowItem icon={BallIcon} title="Jogos por dificuldade" desc="Cada acerto vale pontos: cravar zebra rende mais que o favorito. Streak dá bônus de até +200%." heat />
              <HowItem icon={TrophyIcon} title="Tabela & mata-mata" desc="Acertar a classificação exata e o bracket vale pontos extras — quanto mais difícil, mais pontos." />
              <HowItem icon={UsersIcon} title="Ranking & bolão" desc="O total te coloca no ranking geral (premiado pela 7K) e no do seu grupo (com bolão)." />
            </div>
          </Card>
        </div>

        {/* Lateral */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2 mb-3">Seu desempenho</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-text-2">Pontos</p>
                <p className="font-heading text-3xl font-extrabold text-heat tabular-nums leading-none mt-1">{num(score.total)}</p>
              </div>
              <div>
                <p className="text-[11px] text-text-2">Ranking geral</p>
                <p className="font-heading text-3xl font-extrabold text-text tabular-nums leading-none mt-1">
                  {started ? `${global.you.position}º` : "—"}
                </p>
              </div>
            </div>
            {started && (
              <p className="mt-3 text-xs text-text-2">
                Top {globalPct}% de {num(global.total)}
                {groups.length > 0 && ` · em ${groups.length} ${groups.length === 1 ? "grupo" : "grupos"}`}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2 mb-3">Recompensas</p>
            <ul className="flex flex-col gap-2">
              <Reward label="Participação" detail="Fazer um palpite" unlocked={started} />
              <Reward label="Top 50% geral" detail="Metade de cima do ranking" unlocked={started && globalPct <= 50} />
              <Reward label="Top 3 · prêmio 7K" detail="Pódio do ranking geral" unlocked={started && global.you.position <= 3} heat />
              <Reward label="Cravou o campeão" detail="Acertar a final do bracket" unlocked={allApurado && bt.perTie.fi === true} heat />
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2">Ranking geral</p>
              <Link href="/ranking" className="text-[11px] font-semibold text-brand hover:underline">Ver tudo</Link>
            </div>
            <ul className="flex flex-col gap-1">
              {global.rows.slice(0, 5).map((r) => (
                <li key={r.id} className={cn("flex items-center gap-2 rounded-btn px-2 h-9", r.isCurrentUser && "bg-brand/8")}>
                  <span className="w-4 text-xs font-bold text-text-2 tabular-nums">{r.position}</span>
                  <span className="text-sm" aria-hidden="true">{r.avatar}</span>
                  <span className="flex-1 text-xs font-medium text-text truncate">{r.name}</span>
                  <span className="text-xs font-bold text-text tabular-nums">{num(r.points)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

function PathCard({ href, icon: Icon, title, desc, cta, primary }: { href: string; icon: typeof BallIcon; title: string; desc: string; cta: string; primary?: boolean }) {
  return (
    <Link href={href} className={cn("group flex flex-col rounded-card border p-4 transition-colors", primary ? "border-brand/40 bg-brand/[0.06] hover:border-brand" : "border-border bg-base/40 hover:border-border-strong")}>
      <span className={cn("grid place-items-center h-10 w-10 rounded-card mb-3", primary ? "bg-brand/20 text-brand" : "bg-surface-2 text-text-2")}>
        <Icon width={20} height={20} />
      </span>
      <p className="font-heading text-base font-bold text-text">{title}</p>
      <p className="text-xs text-text-2 mt-1 mb-4 flex-1">{desc}</p>
      <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", primary ? "text-brand" : "text-text")}>
        {cta}
        <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function PickSection({ icon: Icon, title, status, tone, filled, total, hint }: { icon: typeof BallIcon; title: string; status: string; tone: "open" | "muted" | "locked"; filled: number; total: number; hint: string }) {
  const pct = Math.round((filled / total) * 100);
  return (
    <Link href="/palpites" className="group rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-card bg-brand/12 text-brand">
            <Icon width={18} height={18} />
          </span>
          <span className="font-heading text-sm font-bold text-text">{title}</span>
        </span>
        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide", tone === "open" ? "text-brand" : "text-text-3")}>
          {tone === "open" && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
          {status}
        </span>
      </div>
      <p className="text-xs text-text-2 mb-3">{hint}</p>
      <div className="flex items-center gap-2.5">
        <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", tone === "locked" ? "bg-border-strong" : "bg-brand")} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-semibold text-text-2 tabular-nums">{filled}/{total}</span>
        <ArrowRight width={16} height={16} className="text-text-3 group-hover:text-text transition-colors" />
      </div>
    </Link>
  );
}

function HowItem({ icon: Icon, title, desc, heat }: { icon: typeof BallIcon; title: string; desc: string; heat?: boolean }) {
  return (
    <div>
      <span className={cn("grid place-items-center h-9 w-9 rounded-card mb-2", heat ? "bg-heat-soft text-heat" : "bg-brand/12 text-brand")}>
        <Icon width={18} height={18} />
      </span>
      <p className="font-heading text-sm font-bold text-text mb-0.5">{title}</p>
      <p className="text-xs text-text-2 leading-relaxed">{desc}</p>
    </div>
  );
}

function Reward({ label, detail, unlocked, heat }: { label: string; detail: string; unlocked: boolean; heat?: boolean }) {
  return (
    <li className={cn("flex items-center gap-3 rounded-btn border px-3 py-2 transition-colors", unlocked ? (heat ? "border-heat/40 bg-heat-soft" : "border-success/40 bg-success-soft") : "border-border bg-surface-2")}>
      <span className={cn("grid place-items-center h-7 w-7 rounded-full shrink-0 text-sm", unlocked ? (heat ? "bg-heat/20" : "bg-success/20") : "bg-surface-3")} aria-hidden="true">
        {unlocked ? (heat ? "🏆" : "✓") : "🔒"}
      </span>
      <span className="min-w-0">
        <span className={cn("block text-xs font-semibold", unlocked ? "text-text" : "text-text-2")}>{label}</span>
        <span className="block text-[11px] text-text-3 truncate">{detail}</span>
      </span>
    </li>
  );
}
