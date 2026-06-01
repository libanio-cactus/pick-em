"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TrophyIcon, WalletIcon, SearchIcon } from "@/components/ui/icons";

// Itens do cassino 7K — apenas contexto (não navegam). O Pick'Em é o único real.
const CASINO_MAIN = ["Início", "Cassino", "Cassino ao Vivo", "Esportes"];
const CASINO_GAMES = [
  "Jogos Slots",
  "Aviator Crash",
  "Roleta Brasileira",
  "Fortune Tiger",
  "Mines",
];

const TABS = [
  { href: "/", label: "Visão geral" },
  { href: "/palpites", label: "Meu pick'em" },
  { href: "/ranking", label: "Ranking geral" },
  { href: "/grupo", label: "Grupo & Bolão" },
];

function CasinoSidebar({ pickEmActive }: { pickEmActive: boolean }) {
  return (
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border">
        <span className="font-heading text-2xl font-extrabold tracking-tight text-brand">
          7K
        </span>
        <span className="text-[11px] font-medium text-text-3 uppercase tracking-wider">
          Cassino
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {/* Pick'Em — único item real */}
        <div className="px-3 mb-3">
          <Link
            href="/"
            aria-current={pickEmActive ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-btn px-3 h-12 transition-colors",
              pickEmActive
                ? "bg-brand/12 text-text"
                : "text-text-2 hover:bg-surface-2",
            )}
          >
            {pickEmActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r bg-brand" />
            )}
            <span
              className={cn(
                "grid place-items-center h-8 w-8 rounded-lg",
                pickEmActive ? "bg-brand/20 text-brand" : "bg-surface-2 text-text-2",
              )}
            >
              <TrophyIcon width={18} height={18} />
            </span>
            <span className="flex-1 text-sm font-semibold">Pick&apos;Em Copa</span>
            <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-brand text-on-brand">
              Novo
            </span>
          </Link>
        </div>

        <CasinoSection items={CASINO_MAIN} />
        <p className="px-6 mt-4 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-3">
          Cassino
        </p>
        <CasinoSection items={CASINO_GAMES} />
      </div>

      <div className="p-3 border-t border-border">
        <p className="px-2 text-[11px] text-text-3 leading-relaxed">
          Protótipo · dados fictícios
          <br />
          Pick&apos;Em integrado ao 7K
        </p>
      </div>
    </aside>
  );
}

function CasinoSection({ items }: { items: string[] }) {
  return (
    <ul className="px-3 flex flex-col gap-0.5">
      {items.map((label) => (
        <li key={label}>
          <span
            className="flex items-center gap-3 rounded-btn px-3 h-9 text-sm text-text-3 cursor-default select-none"
            aria-disabled="true"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Tabs() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <nav className="flex items-center gap-1 -mb-px" aria-label="Seções do Pick'Em">
      {TABS.map((t) => {
        const active = isActive(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative px-4 h-11 inline-flex items-center text-sm font-semibold whitespace-nowrap transition-colors",
              active ? "text-text" : "text-text-2 hover:text-text",
            )}
          >
            {t.label}
            <span
              className={cn(
                "absolute left-3 right-3 -bottom-px h-0.5 rounded-full",
                active ? "bg-brand" : "bg-transparent",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  // Todo o app é a área Pick'Em embedada no cassino, então o item fica sempre ativo.
  return (
    <div className="flex min-h-screen">
      <CasinoSidebar pickEmActive />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar do cassino */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-base/90 px-4 backdrop-blur md:px-6">
          <Link
            href="/"
            className="lg:hidden font-heading text-xl font-extrabold text-brand"
          >
            7K
          </Link>
          <div className="hidden md:flex flex-1 items-center gap-2 rounded-full border border-border bg-surface px-4 h-9 max-w-sm text-text-3">
            <SearchIcon width={16} height={16} />
            <span className="text-sm">Buscar jogos, provedores…</span>
          </div>
          <div className="flex flex-1 md:flex-none items-center justify-end gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 h-9">
              <WalletIcon width={16} height={16} className="text-brand" />
              <span className="text-sm font-semibold text-text">R$ 1.000,00</span>
            </div>
            <span
              className="grid place-items-center h-9 w-9 rounded-full bg-brand/15 text-sm"
              aria-hidden="true"
            >
              ⭐
            </span>
          </div>
        </header>

        {/* Cabeçalho da área Pick'Em + abas internas */}
        <div className="relative overflow-hidden border-b border-border bg-surface">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-brand/8 blur-3xl"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="flex items-center gap-3 pt-5 pb-3">
              <span className="grid place-items-center h-10 w-10 rounded-card bg-brand/15 text-xl">
                🏆
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand leading-none">
                  Pick&apos;Em
                </p>
                <h1 className="font-heading text-xl font-extrabold tracking-tight text-text leading-tight">
                  Copa do Mundo 2026
                </h1>
              </div>
            </div>
            <Tabs />
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
