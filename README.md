# EvoCloud Frontend - Evolution Interface

Nova interface frontend do Evolution desenvolvida com React, TypeScript e tecnologias modernas.

## Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Linguagem de tipagem estática
- **Vite** - Build tool e dev server
- **React Router 7** - Roteamento
- **TailwindCSS 4** - Framework CSS
- **@evoapi/design-system** - Sistema de design customizado
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **ActionCable** - WebSocket (Rails)
- **date-fns** - Manipulação de datas
- **Zustand** - Gerenciamento de estado
- **i18next** - Internacionalização

## Estrutura do Projeto

```
src/
  ├── assets/           # Recursos estáticos (imagens, ícones, etc.)
  ├── components/       # Componentes reutilizáveis
  │   ├── base/         # Componentes base (badges, buttons customizados)
  │   ├── layout/       # Layout principal, headers, sidebars, notificações
  │   └── ui/           # Componentes básicos do design system
  ├── contexts/         # Contextos React para estado global
  │   ├── AuthContext.tsx           # Autenticação OAuth Bearer tokens
  │   ├── OrganizationsContext.tsx  # Multi-tenancy (accounts)
  │   ├── NotificationsContext.tsx  # Sistema de notificações
  │   ├── ThemeContext.tsx          # Dark/Light mode
  │   └── GlobalConfigContext.tsx   # Configurações globais
  ├── hooks/            # Hooks personalizados
  │   ├── useDarkMode.ts            # Gerenciamento de tema
  │   ├── useLanguage.ts            # Internacionalização
  │   └── useNotificationWebSocket.ts # WebSocket notificações
  ├── pages/            # Componentes de página organizados por domínio
  │   ├── Auth/         # Login, registro, recuperação de senha
  │   ├── Customer/     # Área do cliente
  │   │   ├── Contacts/ # Gerenciamento de contatos
  │   │   └── Conversations/ # Conversas e chat
  │   ├── Admin/        # Área administrativa
  │   └── Settings/     # Configurações do sistema
  ├── routes/           # Configuração de rotas
  ├── services/         # Serviços organizados por funcionalidade
  │   ├── core/         # Configuração base da API
  │   ├── channels/     # Serviços de canais (WhatsApp, Email, etc.)
  │   ├── contacts/     # Gerenciamento de contatos
  │   ├── conversations/ # Conversas e mensagens
  │   ├── notifications/ # Sistema de notificações
  │   └── teams/        # Gerenciamento de equipes
  ├── styles/           # Estilos globais e configurações CSS
  ├── types/            # Tipos e interfaces TypeScript
  ├── utils/            # Funções utilitárias
  └── constants/        # Constantes e configurações
```

## Funcionalidades Implementadas

### ✅ Autenticação & Multi-tenancy
- Sistema completo de autenticação com OAuth Bearer tokens
- Multi-tenancy com organizações/accounts
- Proteção de rotas e middleware de autenticação
- Sistema de permissões por usuário/organização

### ✅ Interface & UX
- Layout responsivo com sidebar colapsível
- Sistema de navegação com submenus (Settings, Reports)
- Dark/Light mode completo
- Internacionalização (i18n) configurada
- Sistema de toast notifications
- Loading states e feedback visual

### ✅ Gerenciamento de Dados
- CRUD completo de contatos com filtros e busca
- Sistema de conversas integrado
- Gerenciamento de canais (WhatsApp, Email, SMS, etc.)
- Paginação e infinite scroll implementados

### ✅ Notificações em Tempo Real
- Sistema de notificações WebSocket integrado
- Bell notification com contador
- Panel de notificações com paginação
- Marca como lida/não lida
- Navegação para conversas a partir das notificações

### ✅ Componentes & Design System
- Componentes reutilizáveis baseados no @evoapi/design-system
- Status badges customizados
- Empty states padronizados
- Scrollbars customizadas para tema escuro
- Componentes de formulário com validação

## Como Executar

1. **Clone e navegue para o diretório:**
   ```bash
   cd evocloud-frontend
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   ```
   Edite `.env.local` com suas configurações:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   pnpm run dev
   ```

## Scripts Disponíveis

- `pnpm run dev` - Servidor de desenvolvimento com hot reload
- `pnpm run build` - Build de produção
- `pnpm run preview` - Preview da build de produção
- `pnpm run test` - Executa testes com Vitest
- `pnpm run test:watch` - Testes em modo watch
- `pnpm run test:coverage` - Testes com coverage
- `pnpm run eslint` - Linting com ESLint
- `pnpm run eslint:fix` - Fix automático de problemas ESLint

## Estrutura de Rotas

```
/auth                    # Login e autenticação
/conversations           # Lista e chat de conversas
/contacts               # Gerenciamento de contatos
/channels               # Configuração de canais
/agents                 # Gerenciamento de agentes
/pipelines              # Pipelines de vendas
/campaigns              # Campanhas de marketing
/automation             # Automações e bots
/reports                # Relatórios e analytics
  ├── /overview         # Visão geral
  ├── /conversations    # Relatório de conversas
  ├── /users           # Relatório de usuários
  └── /labels          # Relatório de etiquetas
/settings               # Configurações
  ├── /account          # Configurações da conta
  ├── /users           # Gerenciamento de usuários
  ├── /teams           # Gerenciamento de equipes
  └── /integrations    # Integrações
```

## Principais Arquivos de Configuração

- `vite.config.ts` - Configuração do Vite com path aliases
- `tailwind.config.js` - Configuração do TailwindCSS
- `tsconfig.json` - Configuração do TypeScript com path mapping
- `.eslintrc.js` - Regras do ESLint
- `src/styles/globals.css` - Estilos globais
- `src/services/core/api.ts` - Configuração base da API

## Convenções de Código

### Path Aliases
O projeto utiliza path aliases configurados no TypeScript e Vite para imports limpos:

```typescript
// ❌ Evite paths relativos
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// ✅ Use path aliases com @/
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
```

**Aliases configurados:**
- `@/` → `src/` (diretório raiz do código)
- `@/components` → `src/components`
- `@/contexts` → `src/contexts`
- `@/hooks` → `src/hooks`
- `@/services` → `src/services`
- `@/pages` → `src/pages`
- `@/types` → `src/types`
- `@/utils` → `src/utils`
- `@/styles` → `src/styles`
- `@/assets` → `src/assets`

## Sistema de Autenticação

O projeto utiliza OAuth Bearer tokens integrado com o backend Rails:
- Headers de autenticação automáticos
- Gerenciamento automático de tokens
- Redirecionamento automático para login quando expirado
- Contexto React para estado de autenticação

## Notificações WebSocket

Sistema completo de notificações em tempo real:
- Conexão WebSocket com ActionCable
- Notificações de novas conversas, menções, etc.
- Interface visual com sino e painel
- Integração com contexto de notificações

## Contribuição

1. Siga os padrões de nomenclatura estabelecidos
2. Use TypeScript para todas as novas funcionalidades
3. Implemente testes para componentes críticos
4. Mantenha consistência com o design system
5. Documente APIs e componentes complexos
