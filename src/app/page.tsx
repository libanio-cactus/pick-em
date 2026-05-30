"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Page";
import { Card } from "@/components/ui/Card";
import {
  ArrowRight,
  BallIcon,
  FireIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { ALL_MATCHES, TOTAL_MATCHES, apuradoGroupSet } from "@/data/groups";
import { ALL_TIES, bracketTally } from "@/data/bracket";
import { FRIENDS_GROUP, standings, SEED_ORDER } from "@/data/friends";
import { usePickEm, usePickems, useMembers, representativePickem } from "@/lib/store";
import { tally, tablePoints } from "@/lib/scoring";
import { percent } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function OverviewPage() {
  const state = usePickEm();
  const { revealed, inGroup, groupName } = state;
  const pickems = usePickems();
  const rep = representativePickem(state);
  const picks = rep?.picks ?? {};
  const order = rep?.order ?? SEED_ORDER;
  const bracket = rep?.bracket ?? {};
  const members = useMembers();
  const rows = standings(members, revealed);
  const me = rows.find((r) => r.member.isCurrentUser)!;

  const apuradoSet = apuradoGroupSet(revealed);
  const t = tally(picks, revealed);
  const bt = bracketTally(bracket);
  const tablePts = tablePoints(order, apuradoSet);
  const allApurado = revealed >= TOTAL_MATCHES;
  const score = t.points + tablePts + (allApurado ? bt.points : 0);

  const matchesFilled = ALL_MATCHES.filter((m) => picks[m.id]).length;
  const rankPct = Math.round((me.position / rows.length) * 100);
  const started = pickems.length > 0;

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
                🏆 Masters da Copa
              </span>
              <h2 className="mt-3 font-heading text-3xl md:text-4xl font-extrabold leading-[1.08] tracking-tight text-text">
                Monte a tabela.{" "}
                <span className="text-brand">Acerte os jogos.</span>{" "}
                <span className="text-heat">Acenda o streak.</span>
              </h2>
              <p className="mt-3 text-sm text-text-2">
                Arraste a classificação de cada grupo, palpite jogo a jogo com
                odds, projete o mata-mata e dispute o ranking e o pool com a galera.
              </p>
            </div>

            {/* Dois caminhos de entrada */}
            <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
              <PathCard
                href="/palpites"
                icon={BallIcon}
                title={started ? "Continuar meu pick'em" : "Montar meu pick'em"}
                desc="Dê seus palpites e dispute o ranking. Você pode jogar sozinho."
                cta={started ? "Continuar" : "Criar pick'em"}
                primary
              />
              <PathCard
                href="/grupo"
                icon={UsersIcon}
                title="Jogar com amigos"
                desc="Crie um grupo, convide a galera e cada um monta o seu pick'em."
                cta="Criar grupo"
              />
            </div>
          </Card>

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
            <h3 className="font-heading text-base font-bold text-text mb-4">
              Como pontua
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <HowItem icon={BallIcon} title="Tabela (classificação)" desc="Pontos por acertar a posição final de cada grupo — exata vale mais que parcial." />
              <HowItem icon={FireIcon} title="Jogos (odds + streak)" desc="Retorno = aposta × odds dos acertos. Acertos seguidos dão bônus de até +200%." heat />
              <HowItem icon={UsersIcon} title="Ranking & pool" desc="Tabela + jogos somam o placar do ranking. Quem lidera leva o pool." />
            </div>
          </Card>
        </div>

        {/* Lateral */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2 mb-3">
              Seu desempenho
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-text-2">Pontos</p>
                <p className="font-heading text-3xl font-extrabold text-text tabular-nums leading-none mt-1">{score}</p>
              </div>
              <div>
                <p className="text-[11px] text-text-2">{inGroup ? "Posição no grupo" : "Posição geral"}</p>
                <p className={cn("font-heading text-3xl font-extrabold tabular-nums leading-none mt-1", me.position === 1 ? "text-heat" : "text-text")}>
                  {revealed > 0 ? `${me.position}º` : "—"}
                </p>
              </div>
            </div>
            {revealed > 0 && (
              <p className="mt-3 text-xs text-text-2">
                Top {rankPct}% · {me.tablePts}t + {me.matchPts}j · {percent(me.accuracy)} de acerto
              </p>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2 mb-3">Recompensas</p>
            <ul className="flex flex-col gap-2">
              <Reward label="Participação" detail="Fazer um palpite" unlocked={started} />
              <Reward label="Top 50%" detail="Metade de cima do grupo" unlocked={revealed > 0 && rankPct <= 50} />
              <Reward label="Top 20%" detail="Entre os melhores" unlocked={revealed > 0 && rankPct <= 20} />
              <Reward label="Cravou o campeão" detail="Acertar a final do bracket" unlocked={allApurado && bt.perTie.fi === true} heat />
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-2">
                {inGroup ? groupName || FRIENDS_GROUP.name : "Ranking da comunidade"}
              </p>
              <Link href="/grupo" className="text-[11px] font-semibold text-brand hover:underline">
                {inGroup ? "Ver tudo" : "Entrar num grupo"}
              </Link>
            </div>
            <ul className="flex flex-col gap-1">
              {rows.slice(0, 5).map((r) => (
                <li key={r.member.id} className={cn("flex items-center gap-2 rounded-btn px-2 h-9", r.member.isCurrentUser && "bg-brand/8")}>
                  <span className="w-4 text-xs font-bold text-text-2 tabular-nums">{r.position}</span>
                  <span className="text-sm" aria-hidden="true">{r.member.avatar}</span>
                  <span className="flex-1 text-xs font-medium text-text truncate">{r.member.name}</span>
                  <span className="text-xs font-bold text-text tabular-nums">{r.points}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

function PickSection({
  icon: Icon,
  title,
  status,
  tone,
  filled,
  total,
  hint,
}: {
  icon: typeof BallIcon;
  title: string;
  status: string;
  tone: "open" | "muted" | "locked";
  filled: number;
  total: number;
  hint: string;
}) {
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
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide",
            tone === "open" ? "text-brand" : tone === "locked" ? "text-text-3" : "text-text-3",
          )}
        >
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

function PathCard({
  href,
  icon: Icon,
  title,
  desc,
  cta,
  primary,
}: {
  href: string;
  icon: typeof BallIcon;
  title: string;
  desc: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-card border p-4 transition-colors",
        primary
          ? "border-brand/40 bg-brand/[0.06] hover:border-brand"
          : "border-border bg-base/40 hover:border-border-strong",
      )}
    >
      <span
        className={cn(
          "grid place-items-center h-10 w-10 rounded-card mb-3",
          primary ? "bg-brand/20 text-brand" : "bg-surface-2 text-text-2",
        )}
      >
        <Icon width={20} height={20} />
      </span>
      <p className="font-heading text-base font-bold text-text">{title}</p>
      <p className="text-xs text-text-2 mt-1 mb-4 flex-1">{desc}</p>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-semibold",
          primary ? "text-brand" : "text-text",
        )}
      >
        {cta}
        <ArrowRight
          width={16}
          height={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
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
