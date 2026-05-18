# Discovery — evo-ai-processor-community: Análise + Upgrade ADK

**Repo:** `evo-ai-processor-community` (submodule de `evo-crm-community`)
**Branch:** `develop` (último commit `810f3bb`, release `v1.0.0-rc3` em 2026-05-17)
**Estado:** Production, single-tenant, ~47k LOC Python, 6 arquivos de teste
**Autor da análise:** Davidson + Claude
**Data:** 2026-05-18

---

## 1. Resumo executivo

O processor está em estado **funcional e em produção**, mas com gaps significativos em três frentes:

| Frente | Severidade | Resumo |
|---|---|---|
| **Upgrade google-adk 1.19.0 → 1.33.0** | Alto risco se feito direto | 14 versões de defasagem, **2 breaking changes** no caminho, **5+ dependências transitivas** com versão mínima maior que o pin atual. **Migration obrigatória de schema de sessões em v1.22.0.** |
| **Qualidade / observabilidade** | Médio | Tipagem incompleta (31% das funções com return type), 6 arquivos de teste para 47k LOC, lifespan ausente, `Base.metadata.create_all` ao lado do Alembic, type hints "mentirosos" em runners |
| **Arquitetura / extensibilidade** | Baixo (já endereçado em rc3) | EXTENSION_POINTS.md já documenta contrato versionado v1.0.0 para Enterprise. Falta: dependency injection consistente em FastAPI, separação de routes "fat" (a2a_routes.py = 2462 linhas, session_routes.py = 1418 linhas) |

**Recomendação:** upgrade ADK em **duas etapas** (1.19 → 1.22.x com migration → 1.33.0) com staging obrigatório. **Não recomendar** o `2.0.0b1` (beta).

---

## 2. Inventário do estado atual

### 2.1. Stack e dependências críticas

| Componente | Versão atual | Função |
|---|---|---|
| Python | 3.10 (mínimo) / 3.11 (Dockerfile) | Runtime |
| `google-adk` | **1.19.0** (2025-11-20) | Core: agentes, runners, sessões, tools, MCP, artifacts, memory |
| `litellm` | `>=1.68.0,<1.69.0` | Provider-neutral LLM client |
| `a2a-sdk` | `0.2.4` | Agent-to-Agent communication |
| `mcp` | `1.9.0` | Model Context Protocol |
| `fastapi` | `0.115.12` | Web framework |
| `pydantic` | `2.11.3` | Validation |
| `google-genai` | `1.50.0` (transitiva) | Google GenAI client |
| `langgraph` | `0.4.1` | Workflow orchestration |
| `sqlalchemy` | `2.0.40` + `asyncpg 0.30.0` | ORM (sync + async) |
| `redis` | `5.3.0` | Cache + pub/sub |
| `opentelemetry-sdk` | `1.37.0` | Observabilidade (Langfuse) |

### 2.2. Estrutura de código

```
src/
├── api/              ← 23 route modules (a2a_routes.py = 2462 LOC, session_routes.py = 1418 LOC, chat_routes.py = 688 LOC)
├── services/
│   └── adk/
│       ├── agents/             ← 9 builders: llm, task, workflow, composite, a2a, external
│       ├── runners/            ← standard / streaming / live + utils
│       ├── tools/              ← evo_crm, google_calendar, google_sheets, knowledge_nexus, etc.
│       ├── artifacts/          ← factory + minio + in_memory providers
│       ├── memory/             ← retention mixin
│       ├── mcp_*.py            ← service, cache, context, lazy tool
│       └── tool_builder.py / custom_tools.py
├── evo_extension_points/  ← capability_gate, runtime_context, usage_reporter (v1.0.0 contrato público)
├── core/                  ← exceptions, exception_handlers, error_codes
├── middleware/            ← evo_auth, rate_limit
└── main.py                ← FastAPI app
```

### 2.3. Usos de `google.adk` no código (40+ módulos)

Superfície de impacto do upgrade:

- **Sessions:** `DatabaseSessionService` (5 arquivos) + `Session` schemas — **alto risco** (mudança de schema em v1.22)
- **Agents:** `LlmAgent`, `BaseAgent`, `SequentialAgent`, `ParallelAgent`, `LoopAgent` (9 builders) — baixo risco
- **Runners:** `Runner`, `InMemoryRunner` + `LiveRequestQueue`, `RunConfig` (4 runners) — baixo/médio
- **Tools:** `FunctionTool`, `ToolContext`, `AgentTool`, `MCPTool`, `MCPToolset`, `MCPSessionManager`, `SseServerParams` (15+ módulos) — médio
- **Models:** `LiteLlm`, `Gemini`, `LlmResponse` — médio (LiteLLM bump exige)
- **Planners:** `PlanReActPlanner` — baixo
- **Artifacts:** `BaseArtifactService`, `InMemoryArtifactService` + custom Minio — baixo
- **Memory:** `BaseMemoryService`, `MemoryEntry`, `SearchMemoryResponse` — baixo
- **Events:** `Event`, `EventActions` — baixo
- **Callbacks:** `CallbackContext` — **risco confirmado zero** (verificamos: `credential_manager` não está em uso)

---

## 3. Upgrade ADK 1.19.0 → 1.33.0 — análise de risco

### 3.1. Breaking changes no caminho

#### BC #1 — v1.22.0 (2026-01-08): novo schema JSON para `DatabaseSessionService`

> "Introduce new JSON-based database schema for DatabaseSessionService, which will be used for newly-created databases. A migration command and script are provided."

**Impacto no processor:**
- O processor usa `DatabaseSessionService` em `service_providers.py:71`, `agent_runner.py`, `runners/standard_runner.py`, `runners/streaming_runner.py`, `runners/live_runner.py` e `session_routes.py` (1418 LOC com lógica de criar sessão tanto na tabela própria quanto no `DatabaseSessionService` por compatibilidade).
- **Bancos existentes em produção precisam rodar `adk migrate session`** antes de subir 1.22+.
- Pular essa migration pode causar runtime errors silenciosos ou perda de histórico de eventos por sessão.

**Ação obrigatória:** parar em v1.22.x em staging, rodar migration, validar leitura de sessões antigas, só então prosseguir.

#### BC #2 — v1.24.0 (2026-02-05): `credential_manager(tool_context)` substitui `(callback_context)`

> "Breaking: Make credential manager accept `tool_context` instead of `callback_context`"

**Impacto no processor:** **ZERO**. Verificado via grep — não existe uso de `credential_manager` no código do processor. O uso de `callback_context` em `llm_agent_builder.py` é para callbacks ADK normais, não para credential manager. Sem refactor necessário.

#### BC #3 — v1.23.0 (2026-01-22): OpenTelemetry para tracing do BigQuery plugin

**Impacto no processor:** **ZERO**. Não usa BigQuery plugin.

### 3.2. Conflitos transitivos de dependência

ADK 1.33.0 (`pyproject.toml` upstream) exige versões maiores que as pinadas atualmente:

| Pacote | Pin atual no processor | Mínimo ADK 1.33 | Severidade |
|---|---|---|---|
| `litellm` | `>=1.68.0,<1.69.0` | `>=1.83.7,<=1.83.14` | **Alta** — pin atual é incompatível, bump de 15 minor versions |
| `a2a-sdk` | `==0.2.4` | `>=0.3.4,<0.4` | **Alta** — bump de minor mas pré-1.0, API pode ter mudado |
| `google-genai` | indireto (1.50.0 instalado) | `>=1.72,<2` | Média |
| `mcp` | `==1.9.0` | `>=1.24,<2` | **Alta** — bump de 15 minors no MCP, verificar `MCPToolset` / `MCPSessionManager` |
| `fastapi` | `==0.115.12` | `>=0.124.1,<1` | Média — bump de 9 minors |
| `pydantic` | `==2.11.3` | `>=2.12,<3` | Baixa — bump de 1 minor |
| `opentelemetry-sdk` | `==1.37.0` | `>=1.36,<=1.41.1` | OK (atual está dentro da faixa) |
| `sqlalchemy` | `==2.0.40` | `>=2,<3` | OK |
| Python | `>=3.10` | `>=3.10` | OK |

**Nota:** A bump de `mcp 1.9 → 1.24` é o segundo maior risco depois do schema de sessões — toda integração MCP (`mcp_service.py`, 953 LOC, `lazy_mcp_tool.py`, `mcp_context.py`, `mcp_cache.py`) precisa ser retestada.

### 3.3. Features novas que valem incorporar pós-upgrade

| Versão | Feature | Por que importa para o processor |
|---|---|---|
| v1.20.0 | `enum constraint` para `agent_name` em `transfer_to_agent` + validação de sub-agent names únicos | Reduz bugs em workflow agents |
| v1.21.0 | `add_session_to_memory` em `CallbackContext`/`ToolContext` | Salvar sessão em memória explicitamente — substitui código custom potencial |
| v1.21.0 | `header_provider` em `OpenAPIToolset`/`RestApiTool` | Auth dinâmico em custom MCP servers |
| v1.22.0 | `LlmAgent.model` opcional com default fallback | Simplifica builders |
| v1.22.0 | `PROGRESSIVE_SSE_STREAMING` ligado por default | Melhora UX no streaming runner |
| v1.23.0 | `add_session_if_not_exists` automático | Reduz boilerplate em `chat_routes.py` |
| v1.24.0 | Toolset authentication para `McpToolset`, `OpenAPIToolset` (`get_auth_config`) | **Resolve gap conhecido** em custom MCP com OAuth (ver `mcp_oauth_service.py` 2237 LOC) |
| v1.24.0 | `McpToolset` ganha métodos para acessar MCP resources | Cobre caso de uso de file-MCPs (Notion, Google Drive) |
| v1.30+ | Anthropic thinking blocks support | Permite usar Claude com extended thinking |
| v1.32.0 | Native OpenTelemetry agentic metrics | Substitui custom OTel manual em `otel_config.py` |
| v1.32.0 | GCP auth provider (2LO/3LO/API Key) | Cobre integração Google Workspace |
| v1.33.0 | `BufferableSessionService` | Pode reduzir round-trips no `DatabaseSessionService` atual |
| v1.33.0 | `get_function_calls`/`get_function_responses` em `LlmResponse` | Simplifica parsing manual em runners |

### 3.4. Sobre o ADK 2.0.0b1

Existe (publicada em 2026-04-22). Reescreve orquestração para um modelo `Workflow(BaseNode)` com `NodeRunner` e ReAct loop explícito. **Beta, não recomendado para produção.** Plano: alvo `1.33.0` agora, monitorar 2.0 GA.

---

## 4. Gaps de qualidade e arquitetura

### 4.1. Críticos (precisam de issue imediata)

| # | Gap | Local | Risco |
|---|---|---|---|
| C1 | **`Base.metadata.create_all()` ao lado do Alembic** | `main.py:147` | Drift silencioso de schema; tabelas criadas fora do controle de migration |
| C2 | **Sem `lifespan` handler** | `main.py` | Redis pool, DB engine, MCP sessions não fechados em shutdown → conexões pendentes em rolling deploy |
| C3 | **Type hint "mentiroso" nos runners** | `runners/*.py`, `agent_runner.py` | Parâmetro tipado como `InMemoryArtifactService` mas factory retorna `MinioArtifactService` em produção. Funciona por duck typing; quebra mypy/IDE; confunde leitor. Trocar por `BaseArtifactService` |
| C4 | **6 arquivos de teste para 47k LOC** | `tests/` | Cobertura ~irrelevante; nenhum teste cobre runners, agent builders, tool builders, MCP service. Upgrade ADK sem teste de regressão é apostar |
| C5 | **Sem CI de testes/lint** | `.github/workflows/` | Único workflow é `docker-publish.yml`. Lint (`flake8`, `black`) configurado em `pyproject.toml` mas nunca rodado em PR |
| C6 | **9 `except:` bare** | `chat_routes.py` (6), `a2a_routes.py`, `http.py`, `text_to_speech.py` | Engole `KeyboardInterrupt`, `SystemExit`, e mascarar bugs |

### 4.2. Importantes

| # | Gap | Local | Risco |
|---|---|---|---|
| I1 | **`llm_agent_builder.py` = 1212 LOC** | `services/adk/agents/llm_agent_builder.py` | God class; lógica de callbacks, contexto, integrações, tools tudo junto. Refactor extraindo `CallbackBuilder`, `ContextInjector`, `IntegrationMerger` |
| I2 | **`a2a_routes.py` = 2462 LOC** | `api/a2a_routes.py` | Route module monolítico; quebrar em `a2a_card_routes.py`, `a2a_task_routes.py`, `a2a_session_routes.py` |
| I3 | **`session_routes.py` = 1418 LOC com fallback manual ao DatabaseSessionService** | `api/session_routes.py:253,1122` | Double-write entre tabela própria e ADK gera inconsistência se uma das duas falhar (já há warnings no log) |
| I4 | **`mcp_oauth_service.py` = 2237 LOC** | `services/mcp_oauth_service.py` | OAuth handshake manual para 10+ providers; v1.24+ do ADK introduz `get_auth_config` no toolset — pode eliminar parte significativa desse código |
| I5 | **Tipagem incompleta: 258/837 funções (~31%) com return type** | `src/**` | Bugs sutis não detectados por mypy; refactor mais arriscado |
| I6 | **`print()` em 77 lugares** | `src/**` | Bypassa logger estruturado (`setup_logger`); polui stdout, sem level/timestamp |
| I7 | **TODOs em código pago**: free slot calculation, service token para callback | `google_calendar_service.py:414`, `mcp_oauth_service.py:1700` | Features incompletas anunciadas como funcionais |

### 4.3. Menores

| # | Gap | Local |
|---|---|---|
| M1 | Dockerfile instala Docker dentro do container (`curl -fsSL https://get.docker.com`) — não é necessário em runtime e aumenta superfície de ataque | `Dockerfile` |
| M2 | `CORS allow_origins=["*"]` com `allow_credentials=False` — OK mas amplo. Considerar restringir em prod | `main.py:114` |
| M3 | `pyproject.toml` `version = "1.0.0"` desatualizado vs CHANGELOG `v1.0.0-rc3` | `pyproject.toml:11` |
| M4 | Sem `pre-commit` hooks; `black`/`flake8` instalados mas não automatizados | repo root |
| M5 | `.venv/` versionado por engano? (aparece em listagem) → confirmar `.gitignore` | `.gitignore` |

---

## 5. Plano de upgrade ADK 1.19 → 1.33 (4 fases)

### Fase A — Preparação (1-2 dias)

1. **Branch dedicada:** `feature/adk-upgrade-1.33`.
2. **Bump pyproject.toml** (não instalar ainda — só preparar o diff):
   ```toml
   "google-adk==1.33.0",
   "litellm>=1.83.7,<=1.83.14",
   "a2a-sdk>=0.3.4,<0.4",
   "mcp>=1.24,<2",
   "fastapi>=0.124.1,<1",
   "pydantic>=2.12,<3",
   ```
3. **Snapshot do DB de staging** com sessões reais para teste de migration.
4. **Escrever 3 testes de smoke** críticos antes do upgrade (gap C4 não pode ser zerado, mas pelo menos cobrir o caminho feliz):
   - `tests/integration/test_database_session_roundtrip.py` — criar sessão, append event, ler back
   - `tests/integration/test_standard_runner_happy_path.py` — agente LLM mínimo + 1 tool call
   - `tests/integration/test_mcp_toolset_smoke.py` — listar tools de um MCP fake

### Fase B — Salto intermediário para 1.22.x + migration (1 dia)

5. Instalar `google-adk==1.22.1` em staging (versão pré-1.24 que evita o breaking de credential_manager).
6. Rodar `adk migrate session` (CLI do próprio ADK; v1.22.1 reintroduziu o comando).
7. Validar leitura de sessões antigas pelo `session_service.py` e `session_routes.py`.
8. Rodar smoke tests.

### Fase C — Salto para 1.33.0 (1 dia)

9. Bump `google-adk==1.33.0` + restantes pinos transitivos.
10. `uv pip install --dry-run` para confirmar zero conflitos.
11. Rodar smoke tests + lint + boot do app.
12. Verificar `mcp_service.py` (953 LOC) com bump `mcp 1.9 → 1.24` — atenção a mudanças em `MCPToolset.from_server` e `SseServerParams`.
13. Verificar `LiteLlm` calls em `llm_agent_builder.py` com bump `litellm 1.68 → 1.83`.

### Fase D — Adoção de features novas (paralelo / sprint seguinte)

14. Substituir auth manual em `mcp_oauth_service.py` por `MCPToolset.get_auth_config()` (v1.24+) — pode reduzir 30-50% do arquivo.
15. Trocar OTel custom por `native OpenTelemetry agentic metrics` (v1.32).
16. Avaliar `BufferableSessionService` (v1.33) como alternativa ao `DatabaseSessionService` se quisermos reduzir latência.
17. Habilitar `PROGRESSIVE_SSE_STREAMING` (já default em 1.22) no `streaming_runner.py`.

### Fase E — Pós-deploy (1 sprint)

18. Monitorar Langfuse para regressões de latência/erros nos agents.
19. Rodar carga em staging com 100 sessões concorrentes antes de promover.
20. Atualizar `CHANGELOG.md` como `v1.0.0-rc4` com:
    - `BREAKING CHANGE (operator-facing)`: bancos com sessões ADK pré-v1.22 precisam rodar `adk migrate session`.
    - `Changed`: google-adk 1.19 → 1.33.

---

## 6. Issues sugeridas (Linear)

| Título | Tipo | Prioridade | Effort |
|---|---|---|---|
| Upgrade google-adk 1.19 → 1.33 em duas etapas (com migration de sessions) | Tech-debt | Alta | 3-5 dias |
| Adicionar `lifespan` handler em main.py para shutdown limpo | Bug | Alta | 0.5 dia |
| Remover `Base.metadata.create_all()` redundante em main.py | Bug | Alta | 0.25 dia |
| Corrigir type hints `InMemoryArtifactService` → `BaseArtifactService` nos runners | Tech-debt | Média | 0.5 dia |
| Adicionar CI de tests + lint (`pytest` + `flake8` + `black --check`) | Infra | Alta | 1 dia |
| Cobertura de smoke tests: runners + agent builders + MCP toolset (mínimo 30%) | Quality | Alta | 3-5 dias |
| Refactor `llm_agent_builder.py` (1212 LOC) em módulos coesos | Tech-debt | Média | 2 dias |
| Refactor `a2a_routes.py` (2462 LOC) em sub-routers | Tech-debt | Média | 2 dias |
| Substituir 9 `except:` bare por `except Exception:` com logging | Quality | Alta | 0.5 dia |
| Substituir 77 `print()` por `logger.info/debug` | Quality | Média | 0.5 dia |
| Adotar `MCPToolset.get_auth_config` e enxugar `mcp_oauth_service.py` | Refactor (pós-upgrade) | Alta (após upgrade) | 3 dias |
| Pre-commit hooks (black, flake8, isort) | DX | Baixa | 0.25 dia |
| Sincronizar `pyproject.toml version` com CHANGELOG (rc3 → rc4) | Chore | Baixa | 0.1 dia |

**Total estimado:** ~3 sprints para zerar o backlog crítico e médio + completar o upgrade.

---

## 7. Open questions

1. **Quantas sessões ADK existem em produção hoje?** Determina o blast radius do `adk migrate session` em Fase B.
2. **A Enterprise edition já depende do `EXTENSION_POINTS.md` v1.0.0?** Se sim, qualquer mudança nos EPs durante o upgrade exige coordenação (Compatibility Promise é "forever").
3. **`litellm 1.68 → 1.83` afeta provider configs já em uso?** Algumas integrações Claude/Anthropic mudaram parâmetros entre essas versões.
4. **Há plano de promover Community → Enterprise via fork ou via Extension Points apenas?** Influencia se vale investir em refactor agora ou esperar pelo split.
5. **OK promover para `1.0.0-rc4` ou pular direto para `1.0.0` GA pós-upgrade?** Depende de quanto teste em staging.

---

## 8. Próximos passos sugeridos

1. **Aprovar plano de upgrade em 2 etapas** (Fases A-C).
2. **Abrir 13 issues no Linear** (tabela seção 6) com labels `processor`, `tech-debt`, `upgrade`.
3. **Decidir se Fase D (adoção de features novas)** entra na mesma sprint ou na seguinte.
4. **Antes de qualquer código, escrever os 3 smoke tests** (seção 5, item 4) — eles são o safety net do upgrade.
