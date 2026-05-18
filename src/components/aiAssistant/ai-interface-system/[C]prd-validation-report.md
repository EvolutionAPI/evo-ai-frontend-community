---
workflowType: 'prd-validation'
targetPrd: 'prd.md'
date: '2026-05-18'
validator: 'Davidson + Claude'
mode: 'codebase review + web research (Lovable/Replit/V0/Cursor/Bolt/Claude Code Auto Mode)'
---

# Relatório de Validação — PRD AI Interface System

**Alvo:** `prd.md` (mesma feature folder)
**Critérios:** workflow oficial `_evo/bmm/workflows/2-plan-workflows/create-prd/workflow-validate-prd.md` (evo-method) + codebase review + research em produtos AI-assisted leading edge.

---

## 1. Sumário executivo

| Dimensão | Resultado |
|---|---|
| **Estrutura & format** | ✅ 12 capítulos + ToC implícita por numeração. Frontmatter completa com `stepsCompleted`. |
| **Information density** | ✅ Anti-patterns escaneados; sem "easy to use", "intuit", "user-friendly" como adjetivos vagos. "Responsivo" usado só em contexto técnico legítimo (mobile responsivo). |
| **Traceability chain** (Vision → Success → Journeys → FR) | ✅ Cada FR (`F-ONB-*`, `F-AST-*`, `F-ESP-*`, `F-UX-*`) rastreável a uma jornada/visão. |
| **FR quality (SMART)** | ✅ Capabilities, não implementação. Formato Given/When/Then consistente. |
| **NFR measurability** | ✅ Metas numéricas em todas (TTFR p50 ≤ 1.5s, p95 ≤ 3s, etc.). |
| **Domain compliance** (CRM + LGPD) | ✅ Seção 11.3 dedicada a LGPD. |
| **Risk completeness** | ✅ 10 riscos técnicos + 4 produto + 4 UX + 15 open questions. |
| **Codebase fidelity** | ⚠️ 7 ajustes aplicados (ver §3). |
| **Aderência a padrões AI-assisted leading edge** | ✅ Padrões Lovable/Replit/V0/Cursor incorporados em §10.4 e roadmap. |

**Veredito:** ✅ **APROVADO para próxima fase (Architecture)** com correções de codebase aplicadas.

---

## 2. Validação contra critérios EVO PRD

### 2.1 Information density (anti-patterns)

Auditoria automática:
- "easy to use" / "user-friendly" / "intuit*" — **0 ocorrências**
- "fast" como adjetivo subjetivo — **0 ocorrências**
- "responsivo" — **2 ocorrências**, ambas em §11.6/§11.8 falando de design responsivo (mobile-first), uso legítimo
- "in order to" / "allow users to" / "it is important" — **0 ocorrências**

✅ **Aprovado.**

### 2.2 Traceability chain

| Vision (§2) | → | Success (§4) | → | Journey (§5) | → | FR (§10) |
|---|---|---|---|---|---|---|
| Lovable-for-CRM, TTO ≤ 10 min | → | TTO p50 ≤ 10 min | → | Jornada 1 (onboarding) | → | F-ONB-01 a F-ONB-07 |
| Chat como interface primária | → | Retorno em 7 dias ≥ 50% | → | Jornada 2 (assistente) | → | F-AST-01 a F-AST-07 |
| Agentes especializados | → | Custo médio ≤ US$ 0.10 | → | Jornada 3 (Agente IA) | → | F-ESP-01 a F-ESP-04 |
| Padrões AI-assisted (Lovable/Replit/V0) | → | Aceite IA ≥ 60% | → | (transversal) | → | F-UX-01 a F-UX-11 |

✅ **Rastreabilidade completa.**

### 2.3 Domain compliance

| Requisito de domínio | Coberto em |
|---|---|
| RBAC por feature/usuário | §11.2 + F-AST-04 + F-UX-02 |
| LGPD (export, delete, retenção) | §11.3 |
| Auditoria de tool calls | §11.2 + Q-15 |
| White-label (tokens semânticos) | §1 (estado atual) + §11.8 |
| Multi-idioma (6 locales) | §11.7 |
| Single-tenant, self-hosted | §3 + restrições críticas |

✅ **Coberto.**

---

## 3. Codebase review — inconsistências encontradas & correções aplicadas

Despachei um agente para conferir cada claim técnica do PRD contra a codebase real.

### 3.1 Confirmações (✅)

1. `/setup` e `/setup/onboarding` existem no path correto
2. Knowledge Nexus já existe como integração configurável
3. AgentWizardModal suporta `embedded`
4. SSE já implementado no processor (via `sse_starlette.EventSourceResponse`, ~630 linhas em `a2a_routes.py`)
5. Tela `/assistant` existe e está roteada (mas conectada ao mock)
6. **google-adk 1.19.0 está sim no `requirements.txt`** do processor (validação contra-checada — o agente errou esse ponto inicialmente; PRD está correto)

### 3.2 Inconsistências corrigidas no PRD (⚠️ → ✅)

| Inconsistência | Status anterior no PRD | Status atualizado |
|---|---|---|
| **Survey tem 8 campos, não 7** (`mainChannelOther` é campo separado) | "7 perguntas" | "8 campos (7 selects + 1 free text 'Other')" |
| **Tours existem: 22, não "10+"** | "10+ tours" | "22 tours" com lista expandida |
| **RouterGuard **prepara** mas **não valida** `setup_survey_completed`** | "✅ Existe e roteia por setup_survey_completed" | "⚠️ Existe e prepara o campo; **validação pendente** — trabalho do MVP" |
| **Session schema do processor não tem campo `type`** | "Schema de session estendido com `type`" | "**Migração obrigatória via Alembic**: schema atual é `id, app_name, user_id, state, create_time, update_time` — adicionar enum `type`" |
| **`tool_registry/` não existe no processor** | implícito que existia | "**Criar novo módulo `tool_registry/`** com estrutura detalhada (registry.py, tools/<domain>/, permissions.py, audit.py)" |
| **Journey ainda não tem `CreateWithAIDialog` integrado no protótipo** | implícito que todas as 9 features estavam | "Journey é a 9ª feature pendente — implementar no MVP" |
| **Cmd+K global não existe** | "Botão flutuante + atalho `Cmd+K`" | "Atalho `Cmd+K` global — não existe hoje, implementar via hook `useHotkeys` no MainLayout" |

### 3.3 Findings críticos que viraram blockers explícitos

Estes itens **bloqueiam o início do MVP** se não endereçados primeiro:

1. **Migration de schema da `Session`** (adicionar campo `type`) — Alembic migration deve ser o primeiro PR do MVP no processor
2. **Tool Registry module** — desenhar a estrutura antes de implementar a primeira tool. Decisão de arquitetura aberta (decorator-based? plugin discovery?)
3. **RouterGuard ativação** — implementar antes que o `OnboardingApplyPanel` seja integrado, caso contrário usuário pode pular o onboarding

Adicionados como riscos R-T-11, R-T-12, R-T-13 (a serem incluídos na próxima iteração de Polish).

---

## 4. Enriquecimento com padrões AI-assisted leading edge

Despachei um agente de research que mapeou padrões de **Lovable.dev**, **Replit Agent 3**, **V0 by Vercel**, **Cursor Composer**, **Bolt.new** e **Claude Code Auto Mode (Anthropic)**.

### 4.1 Padrões incorporados ao PRD (nova subseção §10.4)

11 padrões transversais (F-UX-01 a F-UX-11), distribuídos entre MVP, Growth e Vision:

**MVP (7 padrões):**
- F-UX-01 Modo Planejar/Aplicar (Lovable)
- F-UX-02 Autonomy slider 3-níveis (Replit)
- F-UX-03 Plan → Diff → Approve → Receipt → Undo (Cursor + Smashing pattern)
- F-UX-04 `@mentions` de contexto (Cursor)
- F-UX-07 Streaming de thinking (Claude Code Auto Mode)
- F-UX-08 Conversational forms inline (Dashform/Aisera)
- F-UX-10 Untrusted input boundary anti prompt-injection (Claude Code Auto Mode)

**Growth (3 padrões):**
- F-UX-05 Checkpoints por turno com time-travel (Lovable + V0)
- F-UX-06 Memória cross-session camadas 1+2 (Mem0 pattern)
- F-UX-09 Edição inline no preview (V0)

**Vision (1 padrão):**
- F-UX-11 Sub-agent-as-tool (Supervisor pattern)

### 4.2 Atualização do contrato SSE

Eventos adicionados aos contratos canônicos do processor (§10.5):
- `thinking` — raciocínio resumido entre tool calls
- `plan` — plano numerado antes de execução múltipla
- `inline_form` — pergunta estruturada com schema
- `receipt` — recibo de execução com flag undoable
- `checkpoint` — snapshot do turno

Endpoints adicionados:
- `POST /sessions/{id}/undo` — reverte por receipt_id
- `POST /sessions/{id}/inline-form-submit` — submit de form inline
- `POST /sessions/{id}/checkpoint/restore` — time-travel

### 4.3 Reposicionamento estratégico

§2 (Executive Summary) ganhou callout **"Lovable / Replit Agent / V0, mas para CRM"** explicitando a inspiração e tabela de adaptações pattern-by-pattern.

### 4.4 Fontes do research

Consolidadas no relatório do agente (acima). Inclui:
- Lovable Docs, Lovable 2.0 blog, PingCAP architecture analysis
- Replit Autonomy docs, Agent 3 announcement, Replit incident post-mortem
- V0 iOS app patterns (Vercel blog), V0 complete guide 2026
- Cursor Composer guides
- bolt.new GitHub + guides
- Claude Code Auto Mode (Anthropic engineering blog + InfoQ deep dive)
- Smashing Magazine "Designing Agentic AI Practical UX Patterns" (2026)
- Microsoft Azure AI agent design patterns
- Mem0 "State of AI Agent Memory 2026"
- Dashform / Aisera conversational forms research

---

## 5. Pontos de atenção / próximos passos

### 5.1 Itens a confirmar com stakeholders antes de Architecture

- **Q-13 a Q-15** (versionamento Evolution Docs, privacy de queries, custos do serviço cloud) — decidir antes do beta público
- **Q-02** (camada IA é opt-in por instalação ou sempre-on quando tem LLM key?) — decidir início do MVP
- **Q-09** (limites de tokens por sessão) — definir defaults antes da implementação do `general_agent`

### 5.2 Recomendações para Architecture (ADR)

Decisões que o Architecture document deve fechar:
1. **Schema migration da Session** — strategy (campo enum simples vs. tabela separada `ai_session_metadata`)
2. **Tool Registry pattern** — decorator-based + introspecção automática para `/tools` endpoint
3. **Streaming pattern** — SSE puro vs. WebSocket (PRD recomenda SSE; ADR formaliza)
4. **Memory storage backend** (Growth) — pgvector compartilhado com Knowledge Nexus do cliente OU schema separado
5. **Undo strategy** — event sourcing vs. compensating transactions

### 5.3 Recomendações para o time

- Tirar 1 dia para fazer **spike técnico do Tool Registry** antes de comprometer com 33 tools
- Considerar **Custom GPT / Anthropic Tool Use Anatomy** como referências adicionais durante o spike
- Validar o **modelo de aprovação por hunks (F-UX-03)** com usuário real em pesquisa de 30 min antes de implementar — é o padrão de UX mais novo aqui

---

## 6. Veredito final

| Critério | Status |
|---|---|
| Estrutura conforme template EVO PRD | ✅ |
| Information density | ✅ |
| Traceability chain Vision → FR | ✅ |
| FRs SMART | ✅ |
| NFRs mensuráveis | ✅ |
| Domain compliance (CRM + LGPD + single-tenant) | ✅ |
| Risks + dependencies + open questions explícitos | ✅ |
| Codebase fidelity | ✅ (após correções) |
| Aderência a padrões leading edge | ✅ (Lovable-for-CRM como posicionamento) |
| Pronto para Architecture document | ✅ |

**PRD aprovado para próxima fase.**

---

*Validação executada em 2026-05-18. Codebase commit ref: `develop` branch. Research timestamp: 2026-05-18.*
