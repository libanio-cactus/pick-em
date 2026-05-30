"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { ArrowRight, PlusIcon, BallIcon } from "@/components/ui/icons";
import { TOTAL_MATCHES, apuradoGroupSet } from "@/data/groups";
import {
  usePickEm,
  usePickems,
  createPickem,
  deletePickem,
  type PickEm,
} from "@/lib/store";
import { tally, finalReturn, tableReturn } from "@/lib/scoring";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function MeusPickemsPage() {
  const router = useRouter();
  const { revealed } = usePickEm();
  const pickems = usePickems();

  function novoPickem() {
    const id = createPickem("solo");
    router.push(`/palpites/${id}`);
  }

  return (
    <Container>
      <PageHeader
        eyebrow="Meus palpites"
        title="Meus pick'ems"
        description="Jogando sozinho você pode criar quantos pick'ems quiser — cada um é uma aposta independente. No grupo, vale 1 por participante."
        actions={
          pickems.length > 0 ? (
            <Button onClick={novoPickem}>
              <PlusIcon width={18} height={18} />
              Novo pick&apos;em
            </Button>
          ) : undefined
        }
      />

      {pickems.length === 0 ? (
        <Card>
          <EmptyState
            icon="🎯"
            title="Você ainda não criou nenhum pick'em"
            description="Crie seu primeiro pick'em: arraste a classificação dos grupos, palpite os jogos com odds e projete o mata-mata."
            action={
              <Button onClick={novoPickem}>
                <PlusIcon width={18} height={18} />
                Criar pick&apos;em
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pickems.map((pe) => (
            <PickemCard key={pe.id} pe={pe} revealed={revealed} />
          ))}
          <button
            type="button"
            onClick={novoPickem}
            className="rounded-card border border-dashed border-border bg-surface p-5 flex flex-col items-center justify-center text-center min-h-[140px] transition-colors hover:border-brand/50 group"
          >
            <span className="grid place-items-center h-11 w-11 rounded-full bg-surface-2 text-brand mb-2 group-hover:bg-brand/15">
              <PlusIcon />
            </span>
            <span className="font-heading text-sm font-bold text-text">Novo pick&apos;em</span>
            <span className="text-xs text-text-2 mt-0.5">outra aposta independente</span>
          </button>
        </div>
      )}
    </Container>
  );
}

function PickemCard({ pe, revealed }: { pe: PickEm; revealed: number }) {
  const apuradoSet = apuradoGroupSet(revealed);
  const allApurado = revealed >= TOTAL_MATCHES;
  const t = tally(pe.picks, revealed);
  const total =
    finalReturn(pe.stake, pe.picks, revealed) +
    tableReturn(pe.stake, pe.order, apuradoSet);
  const filled = Object.keys(pe.picks).length;
  const pct = Math.round((filled / TOTAL_MATCHES) * 100);

  return (
    <div className="relative rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      <Link href={`/palpites/${pe.id}`} className="absolute inset-0" aria-label={`Abrir ${pe.name}`} />
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "grid place-items-center h-9 w-9 rounded-card shrink-0",
              pe.scope === "group" ? "bg-brand/15 text-brand" : "bg-surface-2 text-text-2",
            )}
          >
            <BallIcon width={18} height={18} />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-sm font-bold text-text truncate">{pe.name}</p>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-3">
              {pe.scope === "group" ? "Grupo" : "Solo"} ·{" "}
              <span className={pe.confirmed ? "text-success" : "text-text-3"}>
                {pe.confirmed ? "confirmado" : "rascunho"}
              </span>
            </span>
          </div>
        </div>
        {pe.scope === "solo" && (
          <button
            type="button"
            onClick={() => deletePickem(pe.id)}
            aria-label="Excluir pick'em"
            className="relative z-10 grid place-items-center h-8 w-8 rounded-btn text-text-3 hover:text-error hover:bg-error-soft transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] text-text-2">{pe.confirmed && allApurado ? "Retorno final" : "Retorno potencial"}</p>
          <p className="font-heading text-xl font-bold text-heat tabular-nums">{money(total)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-2">Aposta</p>
          <p className="font-heading text-xl font-bold text-text tabular-nums">{money(pe.stake)}</p>
        </div>
      </div>

      {pe.confirmed && revealed > 0 ? (
        <p className="text-xs text-text-2">
          {t.correct}/{t.decided} acertos · streak {t.bestStreak}
        </p>
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-text-2 tabular-nums">{filled}/{TOTAL_MATCHES}</span>
          <ArrowRight width={16} height={16} className="text-text-3" />
        </div>
      )}
    </div>
  );
}
