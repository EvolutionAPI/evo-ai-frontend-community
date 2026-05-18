# Skyway — Guia de Demonstração

> Mock visual do **Skyway**, a camada de IA do Evo CRM Community. Tudo funcional no front sem backend real.
> Stack: React 19 + Tailwind 4 + `@evoapi/design-system`. Storage: localStorage para persistência de sessões.

---

## ⚠️ Antes de começar

```bash
# Frontend rodando em
http://localhost:5173
```

Se quiser **resetar** todas as sessões salvas pela IA (limpar para uma nova demo):

```js
// Console do navegador:
localStorage.removeItem('evo-skyway-sessions-v1')
```

---

## 📍 Roteiro principal (15-20 min)

### Ato 1 — Tela do Assistente Geral (`/assistant`)

**Objetivo:** mostrar o chat principal estilo Lindy + 4 padrões Skyway básicos.

1. Abrir `/assistant`. Mostrar:
   - Hero "Como posso ajudar?"
   - Header com badge `SKYWAY`, toggle **Planejar / Aplicar** e **Autonomy slider** (Conservador / Balanceado / Autopilot)
   - 3 prompts sugeridos (cada um demonstra um padrão diferente)

2. **Padrão 1 — Streaming + Thinking**
   - Clicar em **"Quais conversas de hoje ainda preciso responder?"**
   - Mostrar: linhas em itálico "*Entendendo o pedido…*", "*Consultando o CRM…*" antes da resposta
   - Comparar mentalmente com o "thinking" do Claude/ChatGPT

3. **Padrão 2 — Plan → Diff → Approve → Receipt → Undo**
   - Mudar autonomy para **Autopilot** (todos os steps vêm marcados)
   - Clicar em **"Manda um follow-up amigável para todos os contatos parados há 3 dias"**
   - Skyway emite **Plan card** com 4 steps numerados + tags de risco (safe / confirm / gated)
   - Clicar "Executar 4 passos" → vê thinking + Receipt card com checklist e botão **Desfazer** (timer de 5 min)
   - Voltar pra **Conservador** e mandar mesmo prompt: agora step gated `bulk_send_template` vem **desmarcado** por default

4. **Padrão 3 — Conversational form inline**
   - Clicar em **"Agendar reunião com a Carolina"**
   - IA não responde livre — abre **form inline** dentro do chat com contact / data / duração
   - Preenche e submete → recibo

5. **Padrão 4 — @mentions**
   - No composer, digitar `@car` → popover de busca aparece (↑↓↵)
   - Selecionar "Carolina Mendes" → chip azul no composer
   - Mandar "qual o histórico?" → contexto enviado junto

6. **Modo Planejar**
   - Mudar para **Planejar** (composer ganha borda azul)
   - Mandar qualquer prompt de ação → IA explica o que faria mas **não executa**

---

### Ato 2 — Criar entidades complexas com IA (modais especializados)

**Objetivo:** mostrar que o mesmo padrão Skyway funciona dentro de cada feature complexa.

> **Features cobertas:** Automação, Agente, Jornada, Pipeline, Produto, Template de mensagem, Custom Tool, Custom MCP Server, Segmento, Macro, Role.
>
> **Features deliberadamente fora:** Contatos, Channels, Campaigns. Decisão de produto.

#### 2.1 Pipeline (recomendado começar por aqui — preview mais visual)

1. `/pipelines` → **"+ Novo pipeline"**
2. Dialog abre com:
   - Badge `SKYWAY` no header
   - Toggle Plan/Apply
   - Autonomy slider
3. Digitar: **"funil de vendas B2B SaaS com etapas Lead, Qualificação, Demo, Proposta, Negociação, Fechado"**
4. Painel direito: **PipelinePreview** monta o **kanban** etapa por etapa em streaming
5. Clicar "Criar pipeline" → toast + sessão salva no localStorage
6. **Demonstrar persistência:** abrir um pipeline existente em modo edição → no header aparece o botão **"Continuar com IA"** (dot verde se já tem sessão salva)
7. Clicar → reabre o dialog com **toda a conversa anterior** (mensagens, autonomy, mode)

#### 2.2 Agente (caso mais rico)

1. `/agents/list` → **"+ Novo agente"**
2. Digitar: **"SDR para vendas B2B SaaS que qualifica com BANT e agenda no Google Calendar"**
3. Preview à direita mostra **edit page espelhada**: barra lateral com seções (Perfil ✓ → Sub Agents ✓ → Tools ✓ → Integrações ✓ → MCP Servers ✓ → Produtos ✓ → Configuração ✓) sendo marcadas
4. Cada seção expande com dados (modelo GPT-4 Turbo, integrações Google Calendar e HubSpot MCP, comportamento BANT…)
5. Criar agente
6. Abrir agente para editar — botão **"Editar com IA"** no header (com bolinha verde indicando sessão salva)
7. Clicar → conversa retomada

#### 2.3 Jornada — flow builder com IA

1. `/journeys` → escolher jornada existente → **"Abrir fluxo"** (ícone GitBranch)
2. No editor do canvas (`/journey/:id/flow`), o header agora tem **"Editar com IA"**
3. Clicar → dialog Skyway com **JourneyPreview** (timeline vertical com nós conectados por setas)
4. Digitar: **"onboarding 7 dias para novos clientes"**
5. IA gera **timeline animada** com nós: Gatilho (ContactCreated) → Mensagem boas-vindas → Aguardar 1 dia → Dica → Aguardar 2 dias → Condicional → Tag ativado → Encerrar
6. Cada nó com ícone tonal por categoria (violeta=trigger, azul=mensagem, âmbar=espera, verde=ação)
7. Clicar "Criar jornada" → toast "Fluxo atualizado via IA (mock). Aplicado ao canvas."

> **No produto real**, esse "aplicado ao canvas" significa que os nós/edges entram no `flowData` do BaseFlowEditor.

#### 2.4 Automação

1. `/automation` → **"+ Nova"**
2. Digitar: **"sempre que conversa for criada com tag VIP, atribuir time Contas Estratégicas com prioridade alta"**
3. Preview mostra trigger → condições → ações sendo construído em streaming
4. Aba **Manual** preserva o form tradicional (testar e mostrar que existe)

#### 2.5 Template de mensagem (dentro de Channel Settings)

1. `/channels` → escolher um canal **não-email** → aba **Message Templates** → **"+ Novo template"**
2. Digitar: **"boas-vindas WhatsApp com variáveis {{nome}} e {{produto}}"**
3. Preview: **bolha verde de WhatsApp** com o conteúdo, toggle **"Com exemplos / Variáveis cruas"** (alterna entre `{{nome}}` e "Carolina"), lista de variáveis detectadas

#### 2.6 Custom Tool (NOVO — função HTTP)

1. `/agents/custom-tools` → **"+ Nova"**
2. Digitar: **"GET para Stripe que busca cliente por ID"**
3. Preview mostra: método **GET** colorido, URL `https://api.stripe.com/v1/customers/{id}`, header `Authorization: Bearer ••••`, parâmetro `id` (path, required), exemplo de JSON de resposta

#### 2.7 Custom MCP Server (NOVO)

1. `/agents/custom-mcp-servers` → **"+ Novo"**
2. Digitar: **"Notion MCP com minha integration key"**
3. Preview: URL `https://mcp.notion.com/sse`, header de auth mascarado, **5 ferramentas expostas** descobertas via handshake (`notion.search`, `notion.get_page`, etc.), timeout 30s + retry 2x

#### 2.8 Segmento (NOVO — Settings)

1. `/settings/segments` → **"+ Novo"**
2. Digitar: **"contatos inativos há 60 dias, sem ser VIP"**
3. Preview mostra **3 regras** com lógica AND (last_message_at < hoje-60d, last_purchase_at < hoje-60d, tags não contém "vip") + **contador estimado** "~1842 contatos batem"

#### 2.9 Macro (NOVO — Settings)

1. `/settings/macros` → **"+ Nova"**
2. Digitar: **"tratar como VIP — adiciona tag, atribui time estratégico, prioridade alta"**
3. Preview: **sequência vertical de ações** com setas entre cada step (Tag → Atribuir time → Prioridade → Mensagem)

#### 2.10 Role / Permissions (NOVO — Admin)

1. `/settings/roles` → **"Adicionar role"**
2. Digitar: **"SDR de vendas — acesso a contatos e pipeline, sem settings"**
3. Preview: nome + 7 recursos com **barras de progresso de permissões** (Contatos 3/5, Pipeline 2/6, Settings 0/10…) + estimativa de usuários impactados

---

### Ato 3 — Admin do Skyway (`/settings/admin/skyway`)

**Objetivo:** mostrar o painel completo de configuração da camada IA.

1. **Settings** → **Admin** → **Skyway** (badge "NOVO" verde no sidebar)

2. **Hero card** no topo: status "Skyway ativo · OpenAI · gpt-4o-mini · 1.287 calls hoje"

3. **Aba LLM Provider:**
   - Dropdown de Provider (OpenAI, Anthropic, Fireworks, Self-hosted)
   - API key masked com show/hide
   - Botão **"Testar conexão"** com status "Conectado · responde em ~640ms"
   - Consentimento LGPD com data + nome de quem aceitou
   - Lista de **5 agents** com modelo overridable cada um + volume diário

4. **Aba Autonomia:**
   - Slider default da instalação
   - Tabela de **5 usuários fictícios** (Admin, SDR, Suporte, Vendedora, Estagiário) cada um com seu autonomy slider
   - "5 usuários · 2 com override"

5. **Aba Tool Gating:**
   - 4 stat boxes (total / habilitadas / pedem confirmação / sensíveis)
   - Busca + filtro por risco
   - **13 tools fictícias** com:
     - Nome em fonte monospace
     - Domínio (badge)
     - Calls hoje
     - Select de risco (safe / confirm / gated) — alterar muda o tone
     - Switch enable/disable
   - Knowledge Nexus do cliente vem **desabilitada** (estado realista)

6. **Aba Limits & Usage:**
   - 3 cards Hoje / Semana / Mês (calls, tokens, custo USD)
   - **Orçamento mensal** com barra colorida (verde → âmbar → rosa)
   - Limites de tokens por usuário e por sessão
   - **Top 5 consumidores** com bar chart inline
   - Link para Audit Log

---

## 🎯 Pontos críticos para destacar na apresentação

| Padrão | O que mostrar | Por que importa |
|---|---|---|
| **Plan card** | Steps com tags `gated` desmarcados em Conservador, marcados em Autopilot | Defesa em profundidade — usuário ainda decide |
| **Receipt + Desfazer** | Timer de 5 min, items reversíveis explicitamente | Undo é estado de arte AI-assisted (Lovable/V0) |
| **Autonomy slider** | Por usuário (Admin tem autopilot, Estagiário conservador) | RBAC fino + redução de risco |
| **Tool gating tags** | safe/confirm/gated configurável por admin | Segurança configurável |
| **Continuar com IA** | Botão Skyway no header da edição → conversa antiga volta | Persistência por entidade, igual Lovable/Replit checkpoints |
| **Preview por feature** | Pipeline=kanban, Journey=timeline, Agent=edit page espelhada | UI generativa específica do domínio |
| **Inline form** | Form dentro do chat quando IA precisa de dado estruturado | Padrão Dashform/Aisera — conversa não vira interrogatório |
| **@mentions** | Anexar entidades reais como contexto | Padrão Cursor — escopo de contexto |
| **Modo Planejar/Aplicar** | Toggle no header — Plan não executa nada | Inspirado no Lovable Chat Mode |

---

## 🧪 Triggers escondidos no mock

Caso queira disparar padrões **dentro de qualquer feature específica** (que normalmente só faz streaming + preview), use:

| Trigger no prompt | Dispara |
|---|---|
| `demo:plan` | Plan card |
| `demo:thinking` | Linhas de "thinking" |
| `demo:form` | Inline form |

Exemplo dentro de `/pipelines` → "+ Novo": `demo:plan criar pipeline grande` faz aparecer o plan card mesmo em feature específica.

---

## 🗺️ Mapa completo das features com IA

```
/assistant                              ← chat principal Skyway
/setup/onboarding                       ← survey + (planejado) modo IA pós-survey
/automation             [+ Nova]        ← AutomationPreview
/agents/list            [+ Novo]        ← AgentPreview (espelha edit page)
/agents/:id/edit        [Editar IA]     ← Continuar com IA scoped no agent
/agents/custom-tools    [+ Nova]        ← CustomToolPreview (HTTP function)
/agents/custom-mcp-servers [+ Novo]     ← CustomMcpPreview (handshake)
/pipelines              [+ Novo]        ← PipelinePreview (kanban)
/products               [+ Novo]        ← ProductPreview (card e-commerce)
/journeys               [+ Nova]        ← JourneyPreview (timeline)
/journey/:id/flow       [Editar IA]     ← Skyway dentro do flow editor
/channels/:id/settings  → Message Templates [+ Novo]  ← TemplatePreview
/settings/segments      [+ Novo]        ← SegmentPreview (regras + match count)
/settings/macros        [+ Nova]        ← MacroPreview (sequência de ações)
/settings/roles         [Adicionar]     ← RolePreview (perm. por recurso)
/settings/admin/skyway                  ← Admin de configurações Skyway
```

---

## 🧹 Recursos NÃO implementados no mock (de propósito)

- **Onboarding pós-survey com IA aplicando blocos** (PRD §10.1) — projetado no PRD, fica como próximo passo
- **Sub-agent-as-tool** (Growth) — só conceitual
- **Memória cross-session vector** (Growth/Vision) — só camada 1 e 2 demonstradas via `localStorage`
- **Edição inline no preview** (V0 pattern) — só esboçado
- **Backend real (`evo-ai-processor-community`)** — tudo é mock SSE simulado por `setTimeout`. Streaming verdadeiro vem na Architecture/Build

---

## 🔧 Estrutura técnica (referência rápida)

```
src/components/aiAssistant/
├── AIComposer.tsx              ← input estilo Lindy
├── ChatMessages.tsx            ← bolhas + slot afterMessages
├── CreateWithAIDialog.tsx      ← dialog grande (chat + preview + Plan/Apply + autonomy)
├── *Preview.tsx                ← 13 previews específicos por feature
└── skyway/
    ├── AutonomySlider.tsx
    ├── SkywayPlanCard.tsx
    ├── SkywayReceiptCard.tsx
    ├── ThinkingLine.tsx
    ├── InlineFormBubble.tsx
    ├── MentionPopover.tsx
    ├── EditWithAIButton.tsx    ← botão "Continuar com IA" no header de edição
    └── ContinueWithAIButton.tsx (legado — não usado nas listings)

src/services/aiAssistant/
├── mockAssistant.ts            ← 14 features + buildXxxSteps + composeReply + triggers
└── aiSessionStore.ts           ← persistência localStorage por entityRef
```

---

## ✅ Checklist final antes da apresentação

- [ ] Frontend rodando em http://localhost:5173
- [ ] Login feito (se necessário)
- [ ] Console aberto pra resetar sessões se quiser começar limpo
- [ ] Tema dark mode (Skyway foi desenhado pra dark)
- [ ] Browser em viewport >= 1280px (lado a lado funciona melhor)
- [ ] Ter os prompts de demonstração prontos para colar (lista abaixo)

### Prompts prontos pra colar

**Assistant:**
- Quais conversas de hoje ainda preciso responder?
- Manda um follow-up amigável para todos os contatos parados há 3 dias
- Agendar reunião com a Carolina

**Pipeline:** funil de vendas B2B SaaS com etapas Lead, Qualificação, Demo, Proposta, Negociação, Fechado

**Agent:** SDR para vendas B2B SaaS que qualifica com BANT e agenda no Google Calendar

**Journey:** onboarding 7 dias para novos clientes

**Automation:** sempre que conversa for criada com tag VIP, atribuir time Contas Estratégicas com prioridade alta

**Template:** boas-vindas WhatsApp com variáveis nome e produto

**Custom Tool:** GET para Stripe que busca cliente por ID

**Custom MCP:** Notion MCP com minha integration key

**Segment:** contatos inativos há 60 dias, sem ser VIP

**Macro:** tratar como VIP — adiciona tag, atribui time estratégico, prioridade alta

**Role:** SDR de vendas — acesso a contatos e pipeline, sem settings

---

*Skyway · Mock visual · Sem backend real · Para apresentação de conceito*
