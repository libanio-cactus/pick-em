# CLAUDE.md — Pick'Em Copa do Mundo 2026 (7K)

> Este arquivo é o contexto local do projeto. A Parte Fixa do CLAUDE.md global (foundations Cactus, componentes, acessibilidade, checklist) continua valendo e é carregada automaticamente. Aqui ficam só as decisões específicas deste produto.

---

## Sobre esse projeto

Protótipo funcional de frontend do **Pick'Em Copa 2026**, mecânica de apostas temática embedada nos cassinos B2B da Cactus (operador de referência: **7K**). Objetivo: apresentar à diretoria a jornada completa do produto navegável, com **todos os dados mockados** e **sem backend**.

O apostador monta previsões dos jogos da Copa por fase, aposta um valor, multiplica o retorno pelas odds dos acertos + bônus de streak, e pode criar grupos privados com ranking e pool bet entre amigos.

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
| **Heat (dourado)** | `--color-heat` | `#f5b92b` | **só** streak ativo, odds em destaque, retorno potencial |
| Texto primário | `--color-text` | `#f5f7fa` | |
| Texto secundário | `--color-text-2` | `#8b93a1` | |
| Erro | `--color-error` | `#e15a4c` | |
| Sucesso | `--color-success` | `#8bc34a` | acerto, resultado positivo |

- **Modo:** dark only
- **Radius:** cards `16px` (`--radius-card`), botões `8px` (`--radius-btn`)
- **Tipografia:** Raleway (headings, `--font-heading`) + Montserrat (body, `--font-body`) via `next/font`. **Números sempre em Montserrat** — regra global em `globals.css` força `font-body` em todo elemento com `tabular-nums` (todos os valores numéricos usam essa classe), mesmo dentro de headings.
- **Resolução alvo:** desktop (apresentação). Responsividade é plus, não bloqueia.
- **Regra de cor:** lime = ação/marca; dourado = calor/conquista (streak, odds, retorno). Nunca usar dourado pra CTA comum nem lime pra streak.

## IA — sidebar do cassino + área Pick'Em com abas internas (decisão travada)

O `AppShell` tem uma **sidebar simulando o cassino 7K** (itens decorativos: Cassino ao Vivo, Slots, Aviator…) onde o **Pick'Em é o único item real** — clicar nele abre o nosso projeto. Dentro do Pick'Em, **3 abas internas**. As etapas são estados do mesmo board, não destinos separados.

| Aba | Rota | Conteúdo |
|---|---|---|
| Visão geral | `/` | hero, desempenho (pontos = tabela+jogos / posição), recompensas, leaderboard, status das seções |
| Meus palpites | `/palpites` | **lista de pick'ems** (solo ilimitados) + "Novo pick'em" |
| (builder) | `/palpites/[id]` | monta UM pick'em: sub-abas Fase de grupos / Eliminatórias + aposta + apuração |
| Grupo & Pool | `/grupo` | **empty state** (criar / entrar com código/link) → visão do grupo (ranking, pool, "monte seu pick'em") |

### Múltiplos pick'ems (decisão travada)
- Estado = **lista de pick'ems** (`PickEm[]` na store), cada um com picks/order/bracket/stake/confirmed e `scope`.
- **Solo: ilimitados** (cada um é uma aposta independente, como bilhetes). **Grupo: 1 por participante** (`scope: "group"`, criado via `ensureGroupPickem`) — pra o ranking/pool serem justos.
- `representativePickem` (grupo, senão solo mais recente) alimenta "Você" no ranking e o resumo da Visão geral.
- `revealed` (apuração) e `inGroup/groupName/inPool` são globais; o resto é por pick'em.

### Duas camadas de palpite (decisão travada)
- **Fase de grupos = tabela** (`StandingsTable`): 4 grupos × 4 times. **Drag & drop** pra prever a classificação (top-2 classifica). Cada linha = **só nome do time + odd de classificar** (sem Pts/GM/GC/SG). "Definir jogos" abre modal pra palpitar **V/E/D de cada partida com odds** → alimenta a acumuladora/streak.
- **Eliminatórias** (`Bracket`): **travada ("a definir")** até a fase de grupos ser apurada; depois libera, semeada pelos classificados reais.
- **Pontuação somada:** tabela (classificação, pontos) **+** jogos (odds/streak/retorno). Ranking usa o total. São camadas distintas e rotuladas (t = tabela, j = jogos).

> Não criar nova rota/aba por funcionalidade que pertence ao mesmo fluxo. Resultado = o próprio board/tabela mudando de estado conforme apura.

## Componentes deste projeto

> Specs base no global. Aqui ficam os específicos do Pick'Em.

| Componente | Arquivo | Descrição |
|---|---|---|
| AppShell | `src/components/shell/AppShell.tsx` | Chrome fino do cassino + cabeçalho da área + abas internas (sem sidebar) |
| Button | `src/components/ui/Button.tsx` | `primary` (lime), `secondary` (ghost borda), `heat` (dourado), `ghost` |
| Card | `src/components/ui/Card.tsx` | Superfície padrão radius 16 |
| Modal | `src/components/ui/Modal.tsx` | Overlay + escape/click-fora; usado em pool/convite/criar grupo |
| **StandingsTable** | `src/components/picks/StandingsTable.tsx` | **Tabela de classificação com drag & drop** (e setas p/ teclado): prevê 1º–4º de um grupo, zona de classificação (top-2), só nome + odd, estados exata/parcial/errou na apuração. Diferencial visual |
| **GroupMatchesModal** | `src/components/picks/GroupMatchesModal.tsx` | Modal "Definir jogos": palpite V/E/D de cada partida do grupo com odds → acumuladora |
| **Bracket** | `src/components/picks/Bracket.tsx` | Mata-mata interativo: clica no time que avança, popula a fase seguinte, prevê o campeão. Travado até grupos apurarem. Dados em `src/data/bracket.ts` |
| ReturnMeter | `src/components/picks/ReturnMeter.tsx` | Retorno potencial em tempo real (heat), com value-pop |
| StreakBadge | `src/components/picks/StreakBadge.tsx` | StreakBadge (glow) + StreakLadder (tiers de bônus) |
| RankingTable | `src/components/grupos/RankingTable.tsx` | Ranking do grupo, 1º lugar destacado; **sem** valor apostado/ganho |
| PoolMeter | `src/components/grupos/PoolMeter.tsx` | Pool acumulado + projeção de prêmio |
| Estados | `src/components/ui/States.tsx` | Skeleton, EmptyState, ErrorState |

> **Diferencial visual:** a graça do pick'em é a **montagem em board/tabela** (GroupBoard + Bracket), não um slip de odds. Pick fixa no escudo do time; odds são camada secundária; apuração mostra correto/errado in-place no próprio board (estilo Valorant/CS2).

## Regras de produto (mockadas)

- **Fases:** Grupos → Oitavas → Quartas → Semi → Final. Protótipo cobre **Fase de Grupos com 8 jogos**.
- **Pick por jogo:** Vitória A / Empate / Vitória B.
- **Retorno:** `valor × Π(odds dos picks) × multiplicador de streak projetado`.
- **Streak (por fase, acertos consecutivos):** 3=+20%, 5=+50%, 8=+100%, fase inteira=+200%.
- **Grupo:** ranking por pontuação (acertos ponderados por odds), melhor streak, % acerto. **Nunca exibir valor apostado nem ganho de ninguém.**
- **Pool bet:** soma das entradas − margem da casa (mockada); maior pontuação leva (ou divisão proporcional entre os primeiros).

## Segurança / privacidade do protótipo

- Ranking do grupo **não** revela valor apostado nem ganho — só pontuação e performance. Tratar como invariante de privacidade mesmo no mock.
- Aposta de cada participante é privada e individual.

## UX writing

- **Idioma:** PT-BR. Tom: profissional-vibrante (energia de Copa sem virar caça-níquel).
- **CTAs:** verbo no infinitivo ("Participar", "Confirmar pick'em", "Entrar no pool").
- **Terminologia canônica:** "pick'em" (a montagem da fase), "pick" (escolha de um jogo), "streak", "pool", "fase".

## Decisões travadas (não revisar sem motivo forte)

- Stack Next.js + Tailwind v4 (não Vite) — deploy Vercel pra diretoria.
- Visual híbrido 7K + heat dourado.
- Dark mode único, foco desktop.
- Sem backend / sem auth / sem pagamento real.

## Roadmap

- ✅ Scaffold + foundations + CLAUDE.md
- ⬜ **ETAPA ATUAL:** dados mockados + componentes base + telas dos 9 fluxos
- [ ] Build limpo (`tsc --noEmit` + `next build`) e deploy
