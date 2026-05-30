"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/Page";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RankingTable } from "@/components/grupos/RankingTable";
import { PoolMeter } from "@/components/grupos/PoolMeter";
import {
  ArrowRight,
  CheckIcon,
  CopyIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { FRIENDS_GROUP as GROUP, standings, poolSummary } from "@/data/friends";
import { TOTAL_MATCHES } from "@/data/groups";
import {
  useMembers,
  usePickEm,
  useGroupPickem,
  ensureGroupPickem,
  joinPool,
  createGroup,
  joinGroup,
  leaveGroup,
} from "@/lib/store";
import { money, percent } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function GrupoPage() {
  const { inGroup } = usePickEm();
  return inGroup ? <GroupView /> : <GroupEmptyState />;
}

/* ════════════ Primeiro acesso: criar ou entrar ════════════ */
function GroupEmptyState() {
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(false);

  function handleCreate() {
    if (creating) return;
    setCreating(true);
    setTimeout(() => createGroup(createName), 600);
  }
  function handleJoin() {
    const code = joinCode.trim();
    if (!code) {
      setJoinError(true);
      return;
    }
    setJoining(true);
    setTimeout(() => joinGroup(code), 600);
  }

  return (
    <Container className="max-w-4xl">
      <PageHeader
        eyebrow="Jogar com amigos"
        title="Entre num grupo para começar"
        description="Você ainda não está em nenhum grupo. Crie o seu e convide a galera, ou entre no grupo de um amigo com um código ou link de convite."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Criar grupo */}
        <Card className="p-6 flex flex-col">
          <span className="grid place-items-center h-11 w-11 rounded-card bg-brand/15 text-brand mb-3">
            <PlusIcon width={22} height={22} />
          </span>
          <h2 className="font-heading text-lg font-bold text-text">
            Criar um grupo
          </h2>
          <p className="text-sm text-text-2 mt-1 mb-4">
            Você vira o dono, gera um link de convite e cada amigo monta o próprio
            pick&apos;em.
          </p>
          <label htmlFor="g-name" className="text-xs font-medium text-text-2 mb-1.5">
            Nome do grupo
          </label>
          <input
            id="g-name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            maxLength={40}
            placeholder="Ex: Resenha da Copa"
            className="w-full rounded-btn border border-border bg-base px-3 h-11 text-text outline-none transition-colors focus:border-[rgba(197,242,48,0.55)] placeholder:text-text-3 mb-4"
          />
          <Button fullWidth disabled={creating} onClick={handleCreate} className="mt-auto">
            {creating ? "Criando…" : "Criar grupo"}
          </Button>
        </Card>

        {/* Entrar com código */}
        <Card className="p-6 flex flex-col">
          <span className="grid place-items-center h-11 w-11 rounded-card bg-surface-2 text-text-2 mb-3">
            <UsersIcon width={22} height={22} />
          </span>
          <h2 className="font-heading text-lg font-bold text-text">
            Entrar num grupo
          </h2>
          <p className="text-sm text-text-2 mt-1 mb-4">
            Recebeu um convite? Cole o código do grupo. Por link de convite, é só
            abrir o link que você entra direto.
          </p>
          <label htmlFor="g-code" className="text-xs font-medium text-text-2 mb-1.5">
            Código de convite
          </label>
          <input
            id="g-code"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase());
              setJoinError(false);
            }}
            placeholder="Ex: COPA-7K-4F2A"
            aria-invalid={joinError}
            className={cn(
              "w-full rounded-btn border bg-base px-3 h-11 text-text outline-none transition-colors placeholder:text-text-3 tracking-wider mb-1",
              joinError ? "border-error" : "border-border focus:border-[rgba(197,242,48,0.55)]",
            )}
          />
          <p className={cn("text-xs mb-3", joinError ? "text-error" : "text-text-3")}>
            {joinError ? "Informe um código para entrar." : "Dica da demo: use COPA-7K-4F2A."}
          </p>
          <Button
            variant="secondary"
            fullWidth
            disabled={joining}
            onClick={handleJoin}
            className="mt-auto"
          >
            {joining ? "Entrando…" : "Entrar no grupo"}
          </Button>
        </Card>
      </div>
    </Container>
  );
}

/* ════════════ Dentro do grupo ════════════ */
function GroupView() {
  const router = useRouter();
  const members = useMembers();
  const { revealed, inPool, groupName } = usePickEm();
  const groupPe = useGroupPickem();
  const rows = standings(members, revealed);
  const leader = rows[0];
  const pool = poolSummary(members);
  const myPickEmReady = !!groupPe && Object.keys(groupPe.picks).length > 0;
  const friendsReady = members.filter((m) => !m.isCurrentUser);
  const name = groupName || GROUP.name;

  function abrirMeuPickem() {
    const id = ensureGroupPickem();
    router.push(`/palpites/${id}`);
  }

  const [poolOpen, setPoolOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const projectedWithUser = inPool
    ? pool
    : poolSummary(members.map((m) => (m.isCurrentUser ? { ...m, inPool: true } : m)));

  function handleJoin() {
    setJoining(true);
    setTimeout(() => {
      joinPool();
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
      {/* Header do grupo */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-12 w-12 rounded-card bg-brand/12 text-2xl">
            ⚽
          </span>
          <div>
            <h2 className="font-heading text-2xl font-bold text-text">{name}</h2>
            <p className="text-xs text-text-2 flex items-center gap-1.5">
              <UsersIcon width={14} height={14} />
              {members.length} participantes · grupo privado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => leaveGroup()}>
            Sair do grupo
          </Button>
          <Button variant="secondary" onClick={() => setInviteOpen(true)}>
            <CopyIcon width={18} height={18} />
            Convidar
          </Button>
        </div>
      </div>

      {/* Seu pick'em no grupo */}
      <div className="mb-5 rounded-card border border-border bg-surface p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid place-items-center h-11 w-11 rounded-card shrink-0",
              myPickEmReady ? "bg-success/15 text-success" : "bg-brand/12 text-brand",
            )}
          >
            {myPickEmReady ? <CheckIcon width={22} height={22} /> : <span className="text-xl">⭐</span>}
          </span>
          <div>
            <p className="font-heading text-sm font-bold text-text">
              {myPickEmReady ? "Seu pick'em está montado" : "Monte seu pick'em no grupo"}
            </p>
            <p className="text-xs text-text-2">
              Cada participante faz o próprio — individual e privado.{" "}
              {!myPickEmReady && "Os amigos já montaram os deles."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {friendsReady.map((m) => (
                <span
                  key={m.id}
                  title={`${m.name} · pick'em pronto`}
                  className="relative grid place-items-center h-8 w-8 rounded-full border-2 border-surface bg-surface-2 text-sm"
                  aria-hidden="true"
                >
                  {m.avatar}
                  <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center h-3.5 w-3.5 rounded-full bg-success text-on-brand">
                    <CheckIcon width={9} height={9} />
                  </span>
                </span>
              ))}
            </div>
            <span className="text-xs text-text-3">prontos</span>
          </div>
          <Button variant={myPickEmReady ? "secondary" : "primary"} onClick={abrirMeuPickem}>
            {myPickEmReady ? "Editar pick'em" : "Montar meu pick'em"}
            <ArrowRight width={18} height={18} />
          </Button>
        </div>
      </div>

      {revealed === 0 && (
        <div className="mb-5 rounded-card border border-info/30 bg-[var(--color-info-soft)] px-4 py-3 text-sm text-text-2">
          O ranking ganha vida conforme os jogos são apurados. Avance a simulação em{" "}
          <ButtonLink href="/palpites" variant="ghost" className="!inline !h-auto !px-1 !text-info">
            Meus palpites
          </ButtonLink>
          .
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Ranking da fase</SectionTitle>
            <span className="text-xs text-text-3">{revealed}/{TOTAL_MATCHES} jogos apurados</span>
          </div>
          <RankingTable rows={rows} />
        </Card>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <PoolMeter members={members} leaderName={leader.member.name} />
          {inPool ? (
            <div className="rounded-card border border-success/40 bg-success-soft p-4 flex items-center gap-3">
              <CheckIcon width={20} height={20} className="text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text">Você está no pool</p>
                <p className="text-xs text-text-2">
                  Entrou com {money(GROUP.poolEntry)}. Termine em 1º para levar.
                </p>
              </div>
            </div>
          ) : (
            <Button size="lg" variant="heat" fullWidth onClick={() => setPoolOpen(true)}>
              Entrar no pool · {money(GROUP.poolEntry)}
            </Button>
          )}
          <p className="text-center text-[11px] text-text-3 px-2">
            O pool é opcional. Quem não entra continua valendo no ranking.
          </p>
        </aside>
      </div>

      {/* Modal: entrar no pool */}
      <Modal
        open={poolOpen}
        onClose={() => setPoolOpen(false)}
        title="Entrar no pool"
        description="Sua entrada vira parte do prêmio. O valor que cada um aposta no próprio pick'em segue privado."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPoolOpen(false)}>Cancelar</Button>
            <Button variant="heat" onClick={handleJoin} disabled={joining}>
              {joining ? "Entrando…" : `Confirmar ${money(GROUP.poolEntry)}`}
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <Row label="Valor de entrada" value={money(GROUP.poolEntry)} />
          <Row label="Participantes no pool" value={`${pool.count} → ${projectedWithUser.count}`} />
          <Row label="Margem da casa" value={percent(GROUP.houseMarginPct)} muted />
          <div className="h-px bg-border my-1" />
          <Row label="Prêmio projetado" value={money(projectedWithUser.prize)} highlight />
        </div>
      </Modal>

      {/* Modal: convite */}
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
                {GROUP.inviteCode}
              </div>
              <CopyBtn copied={copied === "code"} onClick={() => copy(GROUP.inviteCode, "code")} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-text-2 mb-1.5">Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-btn border border-border bg-base px-4 h-12 flex items-center text-sm text-text-2 truncate">
                {GROUP.inviteLink}
              </div>
              <CopyBtn copied={copied === "link"} onClick={() => copy(GROUP.inviteLink, "link")} />
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
        copied
          ? "border-success text-success bg-success-soft"
          : "border-border text-text-2 hover:text-text hover:border-border-strong",
      )}
    >
      {copied ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
    </button>
  );
}

function Row({
  label,
  value,
  muted,
  highlight,
}: {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-sm", muted ? "text-text-3" : "text-text-2")}>{label}</span>
      <span className={cn("font-heading font-bold tabular-nums", highlight ? "text-heat text-lg" : "text-text")}>
        {value}
      </span>
    </div>
  );
}
