"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ArrowRight, CheckIcon, PlusIcon, UsersIcon } from "@/components/ui/icons";
import { COTA_PRESETS, standings } from "@/data/friends";
import {
  usePickEm,
  useGroups,
  useGroupMembers,
  createGroup,
  joinGroup,
  type UserGroup,
} from "@/lib/store";
import { money, num } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function GruposPage() {
  const router = useRouter();
  const groups = useGroups();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <Container>
      <PageHeader
        eyebrow="Jogar com amigos"
        title="Meus grupos"
        description="Você pode estar em vários grupos ao mesmo tempo — cada um com seu próprio bolão. Seu pick'em vale em todos."
        actions={
          groups.length > 0 ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setJoinOpen(true)}>
                Entrar com código
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={18} height={18} />
                Criar grupo
              </Button>
            </div>
          ) : undefined
        }
      />

      {groups.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6 flex flex-col">
            <span className="grid place-items-center h-11 w-11 rounded-card bg-brand/15 text-brand mb-3">
              <PlusIcon width={22} height={22} />
            </span>
            <h2 className="font-heading text-lg font-bold text-text">Criar um grupo</h2>
            <p className="text-sm text-text-2 mt-1 mb-4 flex-1">
              Vire o dono, defina a cota do bolão e convide a galera.
            </p>
            <Button fullWidth onClick={() => setCreateOpen(true)}>Criar grupo</Button>
          </Card>
          <Card className="p-6 flex flex-col">
            <span className="grid place-items-center h-11 w-11 rounded-card bg-surface-2 text-text-2 mb-3">
              <UsersIcon width={22} height={22} />
            </span>
            <h2 className="font-heading text-lg font-bold text-text">Entrar num grupo</h2>
            <p className="text-sm text-text-2 mt-1 mb-4 flex-1">
              Tem um código ou link de convite? Entre no grupo de um amigo.
            </p>
            <Button variant="secondary" fullWidth onClick={() => setJoinOpen(true)}>
              Entrar com código
            </Button>
          </Card>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-card border border-dashed border-border bg-surface p-5 flex flex-col items-center justify-center text-center min-h-[150px] transition-colors hover:border-brand/50 group"
          >
            <span className="grid place-items-center h-11 w-11 rounded-full bg-surface-2 text-brand mb-2 group-hover:bg-brand/15">
              <PlusIcon />
            </span>
            <span className="font-heading text-sm font-bold text-text">Novo grupo</span>
            <span className="text-xs text-text-2 mt-0.5">ou entre com um código</span>
          </button>
        </div>
      )}

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(name, cota) => {
          const id = createGroup(name, cota);
          router.push(`/grupo/${id}`);
        }}
      />
      <JoinGroupModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={(code) => {
          const id = joinGroup(code);
          router.push(`/grupo/${id}`);
        }}
      />
    </Container>
  );
}

function GroupCard({ group }: { group: UserGroup }) {
  const { revealed } = usePickEm();
  const members = useGroupMembers(group.id);
  const rows = standings(members, revealed);
  const me = rows.find((r) => r.member.isCurrentUser)!;

  return (
    <Link
      href={`/grupo/${group.id}`}
      className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid place-items-center h-10 w-10 rounded-card bg-brand/12 text-xl">⚽</span>
          <div className="min-w-0">
            <p className="font-heading text-sm font-bold text-text truncate">{group.name}</p>
            <p className="text-[11px] text-text-2 flex items-center gap-1">
              <UsersIcon width={12} height={12} /> {members.length} · cota {money(group.cota)}
            </p>
          </div>
        </div>
        <ArrowRight className="text-text-3 shrink-0" />
      </div>
      <div className="flex items-center justify-between rounded-btn bg-surface-2 px-3 h-11">
        <span className="text-xs text-text-2">Sua posição</span>
        <span className="font-heading text-sm font-bold text-text tabular-nums">
          {revealed > 0 ? `${me.position}º de ${rows.length}` : `${num(me.points)} pts`}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px]">
        {group.inBolao ? (
          <span className="inline-flex items-center gap-1 text-success font-semibold">
            <CheckIcon width={12} height={12} /> no bolão
          </span>
        ) : (
          <span className="text-text-3">fora do bolão</span>
        )}
      </div>
    </Link>
  );
}

function CreateGroupModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, cota: number) => void;
}) {
  const [name, setName] = useState("");
  const [cota, setCota] = useState(50);
  const [custom, setCustom] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Criar grupo"
      description="Você vira o dono e define a cota do bolão. Quem entrar monta o próprio pick'em."
      width={480}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onCreate(name, cota)} disabled={cota <= 0}>
            Criar grupo
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">
        <div>
          <label htmlFor="cg-name" className="block text-xs font-medium text-text-2 mb-1.5">
            Nome do grupo
          </label>
          <input
            id="cg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Ex: Resenha da Copa"
            className="w-full rounded-btn border border-border bg-base px-3 h-11 text-text outline-none transition-colors focus:border-[rgba(197,242,48,0.55)] placeholder:text-text-3"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-2 mb-1.5">
            Cota do bolão <span className="text-text-3">(o que cada um paga pra entrar)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {COTA_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setCota(v);
                  setCustom(false);
                }}
                className={cn(
                  "rounded-btn border h-10 text-sm font-semibold transition-colors",
                  !custom && cota === v
                    ? "border-brand text-brand bg-brand/10"
                    : "border-border text-text-2 hover:text-text hover:border-border-strong",
                )}
              >
                {money(v)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCustom(true)}
            className={cn(
              "mt-2 text-xs font-semibold",
              custom ? "text-brand" : "text-text-2 hover:text-text",
            )}
          >
            Outro valor
          </button>
          {custom && (
            <div className="mt-2 flex items-center rounded-btn border border-border bg-base px-3 h-11 focus-within:border-[rgba(197,242,48,0.55)]">
              <span className="text-text-2 text-sm font-medium mr-1">R$</span>
              <input
                autoFocus
                inputMode="numeric"
                value={cota === 0 ? "" : cota}
                onChange={(e) => setCota(Number(e.target.value.replace(/\D/g, "")) || 0)}
                className="w-full bg-transparent font-heading text-lg font-bold text-text outline-none tabular-nums"
              />
            </div>
          )}
          <p className="mt-2 text-[11px] text-text-3">
            Entrar no bolão é opcional pra cada participante. Quem ficar de fora segue valendo no ranking.
          </p>
        </div>
      </div>
    </Modal>
  );
}

function JoinGroupModal({
  open,
  onClose,
  onJoin,
}: {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Entrar num grupo"
      description="Cole o código de convite. Por link, é só abrir o link que você entra direto."
      width={440}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!code.trim()) return setError(true);
              onJoin(code);
            }}
          >
            Entrar no grupo
          </Button>
        </>
      }
    >
      <div className="py-1">
        <label htmlFor="jg-code" className="block text-xs font-medium text-text-2 mb-1.5">
          Código de convite
        </label>
        <input
          id="jg-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(false);
          }}
          placeholder="Ex: COPA-7K-4F2A"
          aria-invalid={error}
          className={cn(
            "w-full rounded-btn border bg-base px-3 h-11 text-text outline-none transition-colors placeholder:text-text-3 tracking-wider",
            error ? "border-error" : "border-border focus:border-[rgba(197,242,48,0.55)]",
          )}
        />
        <p className={cn("mt-1.5 text-xs", error ? "text-error" : "text-text-3")}>
          {error ? "Informe um código para entrar." : "Dica da demo: use COPA-7K-4F2A."}
        </p>
      </div>
    </Modal>
  );
}
