"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/Page";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { RankingTable } from "@/components/grupos/RankingTable";
import { PoolMeter } from "@/components/grupos/PoolMeter";
import { ArrowRight, CheckIcon, CopyIcon, UsersIcon } from "@/components/ui/icons";
import { FRIENDS_GROUP, standings, poolSummary } from "@/data/friends";
import { TOTAL_MATCHES } from "@/data/groups";
import {
  usePickEm,
  useGroup,
  useGroupMembers,
  joinBolao,
  leaveGroup,
} from "@/lib/store";
import { money, percent } from "@/lib/format";
import { cn } from "@/lib/cn";

function inviteFor(id: string, name: string) {
  if (id === FRIENDS_GROUP.id)
    return { code: FRIENDS_GROUP.inviteCode, link: FRIENDS_GROUP.inviteLink };
  const code = `COPA-${id.replace("g_", "").toUpperCase()}${name.length}F`;
  return { code, link: `https://7k.bet/pickem/g/${code}` };
}

export default function GrupoDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { revealed, picks } = usePickEm();
  const group = useGroup(id);
  const members = useGroupMembers(id);

  const [poolOpen, setPoolOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  if (!group) {
    return (
      <Container>
        <Card className="mt-6">
          <EmptyState
            icon="👥"
            title="Grupo não encontrado"
            description="Você não está mais neste grupo. Volte e crie ou entre em outro."
            action={<ButtonLink href="/grupo">Meus grupos</ButtonLink>}
          />
        </Card>
      </Container>
    );
  }

  const rows = standings(members, revealed);
  const leader = rows[0];
  const pool = poolSummary(members, group.cota);
  const myPickEmReady = Object.keys(picks).length > 0;
  const friendsReady = members.filter((m) => !m.isCurrentUser);
  const invite = inviteFor(group.id, group.name);

  const projectedWithUser = group.inBolao
    ? pool
    : poolSummary(
        members.map((m) => (m.isCurrentUser ? { ...m, inPool: true } : m)),
        group.cota,
      );

  function handleJoinBolao() {
    setJoining(true);
    setTimeout(() => {
      joinBolao(id);
      setJoining(false);
      setPoolOpen(false);
    }, 600);
  }
  async function copy(value: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* noop */
    }
    setCopied(which);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <Container>
      <ButtonLink href="/grupo" variant="ghost" className="!px-2.5 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Meus grupos
      </ButtonLink>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-12 w-12 rounded-card bg-brand/12 text-2xl">⚽</span>
          <div>
            <h2 className="font-heading text-2xl font-bold text-text">{group.name}</h2>
            <p className="text-xs text-text-2 flex items-center gap-1.5">
              <UsersIcon width={14} height={14} />
              {members.length} participantes · cota {money(group.cota)} · grupo privado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => { leaveGroup(id); router.push("/grupo"); }}>
            Sair do grupo
          </Button>
          <Button variant="secondary" onClick={() => setInviteOpen(true)}>
            <CopyIcon width={18} height={18} />
            Convidar
          </Button>
        </div>
      </div>

      {/* Seu pick'em */}
      <div className="mb-5 rounded-card border border-border bg-surface p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("grid place-items-center h-11 w-11 rounded-card shrink-0", myPickEmReady ? "bg-success/15 text-success" : "bg-brand/12 text-brand")}>
            {myPickEmReady ? <CheckIcon width={22} height={22} /> : <span className="text-xl">⭐</span>}
          </span>
          <div>
            <p className="font-heading text-sm font-bold text-text">
              {myPickEmReady ? "Seu pick'em está montado" : "Monte seu pick'em"}
            </p>
            <p className="text-xs text-text-2">
              Seu pick&apos;em vale em todos os grupos.{" "}
              {!myPickEmReady && "Os amigos já montaram os deles."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex -space-x-2">
            {friendsReady.map((m) => (
              <span key={m.id} title={`${m.name} · pronto`} className="relative grid place-items-center h-8 w-8 rounded-full border-2 border-surface bg-surface-2 text-sm" aria-hidden="true">
                {m.avatar}
                <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center h-3.5 w-3.5 rounded-full bg-success text-on-brand">
                  <CheckIcon width={9} height={9} />
                </span>
              </span>
            ))}
          </div>
          <ButtonLink href="/palpites" variant={myPickEmReady ? "secondary" : "primary"}>
            {myPickEmReady ? "Editar pick'em" : "Montar pick'em"}
            <ArrowRight width={18} height={18} />
          </ButtonLink>
        </div>
      </div>

      {revealed === 0 && (
        <div className="mb-5 rounded-card border border-info/30 bg-[var(--color-info-soft)] px-4 py-3 text-sm text-text-2">
          O ranking ganha vida conforme os jogos são apurados. Avance a simulação em{" "}
          <ButtonLink href="/palpites" variant="ghost" className="!inline !h-auto !px-1 !text-info">
            Meu pick&apos;em
          </ButtonLink>
          .
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Ranking do grupo</SectionTitle>
            <span className="text-xs text-text-3">{revealed}/{TOTAL_MATCHES} jogos apurados</span>
          </div>
          <RankingTable rows={rows} />
        </Card>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <PoolMeter members={members} cota={group.cota} leaderName={leader.member.name} />
          {group.inBolao ? (
            <div className="rounded-card border border-success/40 bg-success-soft p-4 flex items-center gap-3">
              <CheckIcon width={20} height={20} className="text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text">Você está no bolão</p>
                <p className="text-xs text-text-2">Entrou com {money(group.cota)}. 1º no grupo leva (empate divide).</p>
              </div>
            </div>
          ) : (
            <Button size="lg" variant="heat" fullWidth onClick={() => setPoolOpen(true)}>
              Entrar no bolão · {money(group.cota)}
            </Button>
          )}
          <p className="text-center text-[11px] text-text-3 px-2">
            O bolão é opcional. Quem não entra continua valendo no ranking.
          </p>
        </aside>
      </div>

      {/* Modal bolão */}
      <Modal
        open={poolOpen}
        onClose={() => setPoolOpen(false)}
        title="Entrar no bolão"
        description="Sua entrada vira parte do prêmio do bolão. Quem terminar em 1º no grupo leva (empate divide)."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPoolOpen(false)}>Cancelar</Button>
            <Button variant="heat" onClick={handleJoinBolao} disabled={joining}>
              {joining ? "Entrando…" : `Confirmar ${money(group.cota)}`}
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <Row label="Cota de entrada" value={money(group.cota)} />
          <Row label="Participantes no bolão" value={`${pool.count} → ${projectedWithUser.count}`} />
          <Row label="Margem da casa" value={percent(FRIENDS_GROUP.houseMarginPct)} muted />
          <div className="h-px bg-border my-1" />
          <Row label="Prêmio projetado" value={money(projectedWithUser.prize)} highlight />
        </div>
      </Modal>

      {/* Modal convite */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Convidar para o grupo"
        description="Quem entrar monta o próprio pick'em e cai no ranking."
        footer={<Button onClick={() => setInviteOpen(false)}>Fechar</Button>}
      >
        <div className="space-y-4 py-1">
          <div>
            <p className="text-xs font-medium text-text-2 mb-1.5">Código</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-btn border border-border bg-base px-4 h-12 flex items-center font-heading text-lg font-bold tracking-widest text-brand">
                {invite.code}
              </div>
              <CopyBtn copied={copied === "code"} onClick={() => copy(invite.code, "code")} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-text-2 mb-1.5">Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-btn border border-border bg-base px-4 h-12 flex items-center text-sm text-text-2 truncate">
                {invite.link}
              </div>
              <CopyBtn copied={copied === "link"} onClick={() => copy(invite.link, "link")} />
            </div>
          </div>
        </div>
      </Modal>
    </Container>
  );
}

function CopyBtn({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Copiar"
      className={cn(
        "grid place-items-center h-12 w-12 rounded-btn border shrink-0 transition-colors",
        copied ? "border-success text-success bg-success-soft" : "border-border text-text-2 hover:text-text hover:border-border-strong",
      )}
    >
      {copied ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
    </button>
  );
}

function Row({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-sm", muted ? "text-text-3" : "text-text-2")}>{label}</span>
      <span className={cn("font-heading font-bold tabular-nums", highlight ? "text-heat text-lg" : "text-text")}>{value}</span>
    </div>
  );
}
