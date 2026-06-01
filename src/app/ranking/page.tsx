"use client";

import { Container, PageHeader } from "@/components/ui/Page";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, TrophyIcon } from "@/components/ui/icons";
import { usePickEm } from "@/lib/store";
import { scorePickem } from "@/lib/scoring";
import { globalStandings, HOUSE_PRIZES, type GlobalRow } from "@/data/community";
import { money, num } from "@/lib/format";
import { cn } from "@/lib/cn";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function RankingGeralPage() {
  const { picks, order, bracket, bracketConfirmed, revealed, confirmed } = usePickEm();
  const userScore = scorePickem(
    { picks, order, bracket: bracketConfirmed ? bracket : {} },
    revealed,
  );
  const { rows, you, total } = globalStandings(userScore.total, revealed);
  const top3 = rows.slice(0, 3);
  const board = rows.slice(0, 20);
  const youInBoard = you.position <= 20;
  const started = Object.keys(picks).length > 0;
  const toPrize = you.position > 3 ? rows[2].points - you.points + 1 : 0;

  return (
    <Container>
      <PageHeader
        eyebrow="Temporada Copa 2026"
        title="Ranking geral"
        description="Todos os pick'ems da 7K num ranking só. É 4fun — e a casa premia o Top 3 da temporada."
      />

      {/* Prêmio da casa + pódio */}
      <Card className="relative overflow-hidden p-5 md:p-6 mb-5">
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-heat/10 blur-3xl" />
        <div className="relative flex items-center gap-2 mb-4">
          <TrophyIcon width={18} height={18} className="text-heat" />
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-text">
            Prêmio da 7K · Top 3
          </h2>
          <span className="ml-auto text-xs text-text-2">{num(total)} jogadores</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {top3.map((r, i) => (
            <div
              key={r.id}
              className={cn(
                "relative rounded-card border p-4 flex flex-col items-center text-center",
                r.isCurrentUser ? "border-brand/50 bg-brand/5" : "border-heat/40 bg-heat-soft",
              )}
            >
              <span className="text-3xl leading-none mb-1">{MEDAL[i]}</span>
              <span className="grid place-items-center h-10 w-10 rounded-full bg-base/40 text-lg mb-1">
                {r.avatar}
              </span>
              <p className="text-sm font-semibold text-text truncate max-w-full">
                {r.name}
                {r.isCurrentUser && <span className="text-brand"> (você)</span>}
              </p>
              <p className="font-heading text-lg font-bold text-text tabular-nums">
                {num(r.points)} <span className="text-xs font-medium text-text-2">pts</span>
              </p>
              <p className="mt-1 font-heading text-base font-extrabold text-heat tabular-nums">
                {money(HOUSE_PRIZES[i])}
              </p>
            </div>
          ))}
        </div>
        <p className="relative mt-3 text-[11px] text-text-3">
          Premiação simbólica da demonstração. Pontos = jogos (por dificuldade) + tabela + mata-mata.
        </p>
      </Card>

      {/* Sua posição (se confirmou) */}
      {started ? (
        <Card className="p-4 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-11 w-11 rounded-card bg-brand/12 text-brand font-heading text-lg font-bold tabular-nums">
              {you.position}º
            </span>
            <div>
              <p className="text-sm font-semibold text-text">
                Você · {num(you.points)} pts
              </p>
              <p className="text-xs text-text-2">
                {you.position <= 3
                  ? "Você está na zona de prêmio! 🏆"
                  : revealed === 0
                    ? "Apure os jogos no seu pick'em para o ranking ganhar vida."
                    : `Faltam ${num(toPrize)} pts para o Top 3.`}
              </p>
            </div>
          </div>
          <ButtonLink href="/palpites" variant="secondary">
            {confirmed ? "Editar pick'em" : "Montar pick'em"}
            <ArrowRight width={18} height={18} />
          </ButtonLink>
        </Card>
      ) : (
        <Card className="p-4 mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-text-2">
            Você ainda não montou seu pick&apos;em — monte pra entrar no ranking.
          </p>
          <ButtonLink href="/palpites">
            Montar pick&apos;em
            <ArrowRight width={18} height={18} />
          </ButtonLink>
        </Card>
      )}

      {/* Board */}
      <Card className="p-4">
        <div className="flex flex-col gap-1">
          {board.map((r) => (
            <BoardRow key={r.id} r={r} />
          ))}
          {!youInBoard && (
            <>
              <div className="flex items-center gap-2 py-1.5 px-2 text-text-3 text-xs">
                <span className="h-px flex-1 bg-border" /> ··· <span className="h-px flex-1 bg-border" />
              </div>
              <BoardRow r={you} />
            </>
          )}
        </div>
      </Card>
    </Container>
  );
}

function BoardRow({ r }: { r: GlobalRow }) {
  const podium = r.position <= 3;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-btn px-2.5 h-11",
        r.isCurrentUser ? "bg-brand/8 ring-1 ring-brand/30" : "",
      )}
    >
      <span className="w-7 text-center text-sm font-bold tabular-nums text-text-2">
        {podium ? MEDAL[r.position - 1] : r.position}
      </span>
      <span className="text-base" aria-hidden="true">{r.avatar}</span>
      <span className="flex-1 text-sm font-medium text-text truncate">
        {r.name}
        {r.isCurrentUser && <span className="text-brand font-semibold"> · você</span>}
      </span>
      <span className="font-heading text-sm font-bold text-text tabular-nums">
        {num(r.points)} <span className="text-[11px] font-medium text-text-3">pts</span>
      </span>
    </div>
  );
}
