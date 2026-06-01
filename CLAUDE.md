# CLAUDE.md — Pick'Em Copa do Mundo 2026 (7K)

> Este arquivo é o contexto local do projeto. A Parte Fixa do CLAUDE.md global (foundations Cactus, componentes, acessibilidade, checklist) continua valendo e é carregada automaticamente. Aqui ficam só as decisões específicas deste produto.

---

## Sobre esse projeto

Protótipo funcional de frontend do **Pick'Em Copa 2026**, mecânica de apostas temática embedada nos cassinos B2B da Cactus (operador de referência: **7K**). Objetivo: apresentar à diretoria a jornada completa do produto navegável, com **todos os dados mockados** e **sem backend**.

É **4fun** (grátis, por diversão): o jogador monta previsões da Copa e pontua por dificuldade (jogos + tabela + mata-mata). A 7K premia o Top 3 do ranking geral. Em grupos privados há ranking entre amigos e **bolão** (único dinheiro). Sem aposta no pick'em.

## Stack

- **Natureza:** protótipo de validação (demo pra diretoria)
- **Frontend:** Next.js 16 (App Router) + React 19
- **Estilo:** Tailwind CSS v4 (config CSS-first via `@theme` em `globals.css`)
- **Dados:** 100% mockados em TS (`src/data/`) + module-level store para estado entre telas
- **Deploy:** Vercel (URL compartilhável pra diretoria)
- **Auth:** nenhuma — usuário já está "logado" por padrão

## Direção visual — HÍBRIDO 7K + heat dourado (decisão travada)

O produto vive embedado no cassino 7K, então o visual segue a plataforma real (navy frio + lime), com o dourado Cactus reservado pro momento "uau" do streak/odds. Sobrescreve a paleta padrão do global.

| Papel | Token | Valor | Uso |
|---|---|---|---|
| Fundo base | `--color-base` | `#0d1117` | navy frio quase preto (7K) |
| Superfície | `--color-surface` | `#161b22` | cards, sidebar |
| Superfície elevada | `--color-surface-2` | `#1c222b` | inputs, dropdowns, modais |
| Borda | `--color-border` | `#252b36` | divider sutil |
| **Marca (lime)** | `--color-brand` | `#c5f230` | CTA primário, item ativo, identidade 7K |
| Texto sobre lime | `--color-on-brand` | `#0d1117` | texto escuro em botão lime |
| **Heat (dourado)** | `--color-heat` | `#f5b92b` | **só** streak ativo, pontos em destaque, prêmio da casa |
| Texto primário | `--color-text` | `#f5f7fa` | |
| Texto secundário | `--color-text-2` | `#8b93a1` | |
| Erro | `--color-error` | `#e15a4c` | |
| Sucesso | `--color-success` | `#8bc34a` | acerto, resultado positivo |

- **Modo:** dark only
- **Radius:** cards `16px` (`--radius-card`), botões `8px` (`--radius-btn`)
- **Tipografia:** Raleway (headings, `--font-heading`) + Montserrat (body, `--font-body`) via `next/font`. **Números sempre em Montserrat** — regra global em `globals.css` força `font-body` em todo elemento com `tabular-nums` (todos os valores numéricos usam essa classe), mesmo dentro de headings.
- **Resolução alvo:** desktop (apresentação). Responsividade é plus, não bloqueia.
- **Regra de cor:** lime = ação/marca; dourado = calor/conquista (streak, pontos, prêmio). Nunca usar dourado pra CTA comum nem lime pra streak.

## IA — sidebar do cassino + área Pick'Em com abas internas (decisão travada)

O `AppShell` tem uma **sidebar simulando o cassino 7K** (itens decorativos: Cassino ao Vivo, Slots, Aviator…) onde o **Pick'Em é o único item real** — clicar nele abre o nosso projeto. Dentro do Pick'Em, **3 abas internas**. As etapas são estados do mesmo board, não destinos separados.

| Aba | Rota | Conteúdo |
|---|---|---|
| Visão geral | `/` | hero (2 caminhos), prêmio da casa, desempenho (pontos + rank geral), recompensas, leaderboard geral, status das seções |
| Meu pick'em | `/palpites` | builder único: sub-abas Fase de grupos / Eliminatórias + PointsMeter + apuração in-place |
| Ranking geral | `/ranking` | pódio Top 3 com prêmio da 7K + board global + sua posição |
| Grupo & Bolão | `/grupo` | **Meus grupos** (multi): lista + criar (com cota) / entrar por código/link |
| (detalhe) | `/grupo/[id]` | ranking do grupo + bolão (cota do grupo) + convite + sair |

### Modelo 4fun — PONTOS, sem dinheiro no pick'em (decisão travada)
- **Sem aposta/odds-pagamento.** Pick'em é grátis e vale **pontos por dificuldade**: cravar zebra/colocação difícil rende mais (a odd é só o peso; UI mostra "+X pts", nunca o decimal). Streak = bônus de pontos (+20/50/100/200%).
- **1 pick'em por pessoa** (`store` = pick'em único). É a entrada no ranking geral E em **todos os grupos** que o jogador participa. Sem múltiplos pick'ems (só fazia sentido com aposta).
- **Multi-grupo:** o jogador pode estar em **vários grupos** (`store.groups: UserGroup[]`). Cada grupo tem **cota própria definida pelo dono** na criação (`COTA_PRESETS` + outro). 1 bolão por grupo, entrada opcional. Roster por grupo via `rosterFor(groupId)`.
- **Pontuação total** = jogos (dificuldade + streak) + tabela (classificação exata/parcial) + mata-mata (bracket). `scorePickem` em `scoring.ts`.
- **Ranking geral** (`community.ts`) reúne toda a base; a **7K premia o Top 3** (`HOUSE_PRIZES`). É o gancho de aquisição.
- **Bolão** (`/grupo`, money) é o **único dinheiro** do produto: entrada dos amigos, 1º do grupo leva o pote − margem da casa.

### Camadas de palpite
- **Fase de grupos = tabela** (`StandingsTable`): 4 grupos × 4 times, **drag & drop** pra prever 1º–4º (top-2 classifica). Linha = nome do time + **pontos da colocação**. "Definir jogos" (botão full-width) abre modal pra palpitar V/E/D com **pontos por jogo**.
- **Eliminatórias** (`Bracket`): travada até a fase de grupos apurar; depois libera, semeada pelos classificados reais.
- **Duas etapas de confirmação:** (1) `confirmPickem` confirma a fase de grupos; (2) `confirmBracket` confirma as eliminatórias (só após apuração). Os **pontos do bracket só contam após a etapa 2** (UI alimenta `scorePickem` com `bracket: {}` enquanto `!bracketConfirmed`), e o bracket revela acertos/erros ao confirmar. O botão de confirmar fica no topo, contextual à sub-aba.

> Não criar nova rota/aba por funcionalidade que pertence ao mesmo fluxo. Resultado = o próprio board/tabela mudando de estado conforme apura.

## Componentes deste projeto

> Specs base no global. Aqui ficam os específicos do Pick'Em.

| Componente | Arquivo | Descrição |
|---|---|---|
| AppShell | `src/components/shell/AppShell.tsx` | Chrome fino do cassino + cabeçalho da área + abas internas (sem sidebar) |
| Button | `src/components/ui/Button.tsx` | `primary` (lime), `secondary` (ghost borda), `heat` (dourado), `ghost` |
| Card | `src/components/ui/Card.tsx` | Superfície padrão radius 16 |
| Modal | `src/components/ui/Modal.tsx` | Overlay + escape/click-fora; usado em pool/convite/criar grupo |
| **StandingsTable** | `src/components/picks/StandingsTable.tsx` | **Tabela com drag & drop** (e setas p/ teclado): prevê 1º–4º, zona de classificação (top-2), linha = nome + **pontos da colocação**, estados exata/parcial/errou. Botão "Definir jogos" full-width no rodapé |
| **GroupMatchesModal** | `src/components/picks/GroupMatchesModal.tsx` | Modal "Definir jogos": palpite V/E/D com **pontos por jogo** (dificuldade) |
| **Bracket** | `src/components/picks/Bracket.tsx` | Mata-mata interativo; travado até grupos apurarem. Dados em `src/data/bracket.ts` |
| **PointsMeter** | `src/components/picks/PointsMeter.tsx` | Pontos possíveis em tempo real (heat), quebra jogos/tabela + streak, value-pop |
| StreakBadge | `src/components/picks/StreakBadge.tsx` | StreakBadge (glow) + StreakLadder (tiers de bônus de pontos) |
| RankingTable | `src/components/grupos/RankingTable.tsx` | Ranking do grupo por pontos (j/t/m); 1º destacado |
| PoolMeter | `src/components/grupos/PoolMeter.tsx` | Bolão acumulado + projeção de prêmio (único dinheiro) |
| Estados | `src/components/ui/States.tsx` | Skeleton, EmptyState, ErrorState |

> **Dados:** `teams.ts`, `groups.ts` (4 grupos, jogos, odds=peso de dificuldade), `bracket.ts`, `friends.ts` (grupo de amigos + bolão + geradores), `community.ts` (ranking geral + prêmio).
> **Diferencial visual:** montagem em **tabela/board** (StandingsTable + Bracket), não slip de aposta. Apuração mostra correto/errado in-place (estilo Valorant/CS2).

## Regras de produto (mockadas)

- **Estrutura:** Fase de grupos (4 grupos × 4 times, 24 jogos) → Eliminatórias **Oitavas → Quartas → Semi → Final → Campeão** (todos os 16 classificam, semeados pela ordem dos grupos).
- **Pick por jogo:** Vitória A / Empate / Vitória B → **pontos por dificuldade** (`matchPoints = round(odd × 10)`).
- **Tabela:** prever 1º–4º de cada grupo (top-2 classifica) → pontos por colocação exata (ponderada) / parcial.
- **Streak (acertos consecutivos):** 3=+20%, 5=+50%, 8=+100%, fase inteira=+200% — **bônus de pontos** nos jogos.
- **Mata-mata:** cada chave tem **odd 2-way** (pela força dos times, `tieOdds`); acertar quem avança vale **pontos pela odd** (igual aos jogos) — cravar zebra avançar rende mais. Exibido em "+X pts" por slot. **Não** é pontuação fixa por fase.
- **Ranking geral:** soma dos pontos de todos os jogadores; **7K premia o Top 3** (`HOUSE_PRIZES`).
- **Bolão (grupo):** cota definida pelo dono; prêmio = nº participantes × cota − margem da casa; 1º do grupo leva (**empate divide**). Multi-grupo: o jogador pode entrar no bolão de cada grupo. **Único dinheiro do produto.**

## Segurança / privacidade do protótipo

- Bolão: valor de entrada é fixo e público (é o prêmio); o ranking é por pontos, sem expor dado financeiro pessoal.

## UX writing

- **Idioma:** PT-BR. Tom: profissional-vibrante (energia de Copa sem virar caça-níquel). É **4fun** — evitar linguagem de aposta/risco; falar em "pontos", "dificuldade", "ranking".
- **CTAs:** verbo no infinitivo ("Montar pick'em", "Confirmar pick'em", "Entrar no bolão", "Criar grupo").
- **Terminologia canônica:** "pick'em", "pick", "streak", "bolão" (pool do grupo), "ranking geral", "fase".

## Decisões travadas (não revisar sem motivo forte)

- **Git: trabalhar direto na `main`** — commitar e pushar na `main`. NÃO criar feature branch a menos que o usuário peça. A Vercel publica produção a partir da `main`; branch fora dela quebra o deploy.
- Stack Next.js + Tailwind v4 (não Vite) — deploy Vercel pra diretoria.
- Visual híbrido 7K + heat dourado.
- Dark mode único, foco desktop.
- Sem backend / sem auth / sem pagamento real.

## Roadmap

- ✅ Scaffold + foundations + CLAUDE.md
- ⬜ **ETAPA ATUAL:** dados mockados + componentes base + telas dos 9 fluxos
- [ ] Build limpo (`tsc --noEmit` + `next build`) e deploy
