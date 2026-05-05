# Changelog

All notable changes to **evo-ai-frontend-community** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- N/A

### Changed

- N/A

### Fixed

- N/A

## [v1.0.0-rc2] - 2026-05-05

Release de estabilização — corrige fluxos de criação de usuário, gestão de membros de team, sessão axios e diversos refinamentos de UI.

### Added

- **EVO-987** — criação inline de label a partir do modal "Assign Label". (#33)
- **EVO-1006** — busca e filtros adicionados ao kanban de pipeline. (#30)
- **Brand icons**: substituídas imagens estáticas de brand por `@icons-pack/react-simple-icons`. (#25)
- **Tour**: novo componente de onboarding tour. (#23)

### Fixed

- **Role select no formulário de criação de usuário (issue #16)**: o dropdown ficava aberto mas selecionar uma opção não atualizava o estado do form. Corrigido como Select controlado desde o mount com `placeholder`, deduplicação de roles via `useMemo`, fallback para `agent` / `account_owner` quando system roles não chegam, validação de role obrigatória, estados de loading / error e mensagem inline para o campo. (#28)
- **EVO-1000 — sessão sendo morta em 401 de business**: o axios interceptor invalidava a sessão em qualquer 401 (exceto `/unread_count`). Endpoints que mistakenly retornavam 401 para erro de validação (ex.: criação de team-member antes do fix backend) deslogavam o admin. Agora só termina a sessão quando `error.response.data.error.code` está em `{UNAUTHORIZED, INVALID_TOKEN, TOKEN_EXPIRED, MISSING_TOKEN, INVALID_CREDENTIALS, SESSION_EXPIRED}`. (#26)
- **EVO-1010 — gestão de team members só permitia adicionar**: já-membros tinham checkbox `disabled` e a página nunca chamava endpoint de remoção. Reescrito como visão unificada de manage members (state único `selectedIds` com snapshot inicial; diff calculado no save → `POST` adds + `DELETE` removes em paralelo). Adicionado badge `addUsers.alreadyMemberBadge` e i18n nas 6 locales (`en`, `pt-BR`, `pt`, `es`, `fr`, `it`). (#27)
- **EVO-996** — preview de reply: HTML é stripado e placeholder é renderizado para conteúdos não textuais. (#36)
- **EVO-997** — opção não-funcional de "delete contact" removida do menu de ações do contato. (#37)
- **EVO-977** — push desktop, estado vazio do sino, audio unlock e auto-request de permission corrigidos (3 rounds de review). Trata stale closures, flag de audio unlock, navegação SPA e estado de permission negada.
- **EVO-1012** — regression spec para prioridade de campos do avatar de contato. (#32)
- **WhatsApp groups**: nome do remetente e labels de mídia exibidos corretamente em todo o chat UI. (#34)
- **EVO-974** — wire do operador `OR`, fixes em rewrites de `priority` / `assignee`, filtro de `Contact` adicionado; toast quando filtro `assignee=me` é dropado em sessão expirada.
- **EVO-1002** — não esconde mais templates não-aprovados; tabela de gestão exibe status real do Meta.
- **EVO-1001** — labels de conta carregadas como opções do filtro de conversa. (#24)
- **EVO-971** — fallback para o setup wizard quando `/setup/status` está inacessível. (#22)

### Changed

- **CI**: publica também imagens `develop` para staging. (#20)
- `pnpm-lock.yaml` sincronizado e import de `toast` não usado removido. (#9417fe2)

## [v1.0.0-rc1] - 2026-04-24

### Added

- Primeiro release candidate público do `evo-ai-frontend-community`.
- App React + Vite + TypeScript com:
  - i18n em 6 locales (`en`, `pt-BR`, `pt`, `es`, `fr`, `it`)
  - Páginas de Customer (Settings → Users, Teams, Pipelines, Channels, Inboxes, Integrations)
  - Chat / mensagens / mídia (`MessageImage`, attachments)
  - Filtros de conversa, kanban de pipeline, dashboards
- Cliente axios com interceptors de auth e refresh.
- Tema dark + componentes shadcn/ui.

---

[Unreleased]: https://github.com/EvolutionAPI/evo-ai-frontend-community/compare/v1.0.0-rc2...HEAD
[v1.0.0-rc2]: https://github.com/EvolutionAPI/evo-ai-frontend-community/compare/v1.0.0-rc1...v1.0.0-rc2
[v1.0.0-rc1]: https://github.com/EvolutionAPI/evo-ai-frontend-community/releases/tag/v1.0.0-rc1
