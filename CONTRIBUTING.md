# 🤝 Guia de Contribuição - EvoAI Frontend

## 📋 Índice

- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Convenções de Organização](#-convenções-de-organização)
- [Regras Absolutas](#-regras-absolutas)
- [Guia de Onde Colocar Cada Tipo de Arquivo](#-guia-de-onde-colocar-cada-tipo-de-arquivo)
- [Padrões de Nomenclatura](#-padrões-de-nomenclatura)
- [Boas Práticas](#-boas-práticas)
- [Fluxo de Desenvolvimento](#-fluxo-de-desenvolvimento)

---

## 📂 Estrutura do Projeto

```
src/
├── assets/              # Recursos estáticos (imagens, ícones, fontes, etc.)
│   ├── icons/
│   ├── images/
│   └── fonts/
│
├── components/          # TODOS os componentes (sem exceção!)
│   ├── base/           # Componentes básicos/primitivos reutilizáveis
│   │   ├── Badge/
│   │   ├── StatusBadge/
│   │   └── EmptyState/
│   │
│   ├── shared/         # Componentes compartilhados entre múltiplas features
│   │   ├── SearchBar/
│   │   ├── FilterPanel/
│   │   └── DataTable/
│   │
│   ├── layout/         # Componentes de layout e estrutura
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── MainLayout/
│   │   └── Notification/
│   │
│   ├── features/       # Componentes específicos por domínio/feature
│   │   ├── chat/
│   │   │   ├── ConversationList/
│   │   │   ├── MessageInput/
│   │   │   └── ChatSidebar/
│   │   ├── contacts/
│   │   │   ├── ContactCard/
│   │   │   └── ContactForm/
│   │   ├── channels/
│   │   │   ├── ChannelConfig/
│   │   │   └── ChannelList/
│   │   ├── agents/
│   │   │   ├── AgentCard/
│   │   │   └── AgentConfig/
│   │   ├── campaigns/
│   │   └── integrations/
│   │       ├── GoogleCalendar/
│   │       ├── GitHub/
│   │       └── Slack/
│   │
│   └── ui/             # Componentes do design system (@evoapi/design-system)
│       ├── Button/
│       ├── Input/
│       ├── Select/
│       └── Modal/
│
├── contexts/           # Contextos React para estado global
│   ├── AuthContext.tsx
│   ├── OrganizationsContext.tsx
│   ├── NotificationsContext.tsx
│   ├── ThemeContext.tsx
│   └── GlobalConfigContext.tsx
│
├── hooks/              # TODOS os hooks personalizados
│   ├── auth/
│   │   ├── useAuth.ts
│   │   └── usePermissions.ts
│   ├── chat/
│   │   ├── useChatActions.ts
│   │   └── useMessageHistory.ts
│   ├── contacts/
│   │   └── useContactFilters.ts
│   ├── channels/
│   │   └── useChannelStatus.ts
│   ├── campaigns/
│   │   └── useCampaignMetrics.ts
│   ├── useDarkMode.ts      # Hooks genéricos na raiz
│   ├── useLanguage.ts
│   └── useNotificationWebSocket.ts
│
├── pages/              # APENAS componentes de página (rotas)
│   ├── Auth/
│   │   ├── Auth.tsx            # APENAS componente da página
│   │   └── index.ts            # Export
│   ├── Customer/
│   │   ├── Chat/
│   │   │   ├── Chat.tsx        # APENAS componente da página
│   │   │   └── index.ts
│   │   ├── Contacts/
│   │   │   ├── Contacts.tsx
│   │   │   └── index.ts
│   │   ├── Channels/
│   │   │   ├── Channels.tsx
│   │   │   └── index.ts
│   │   └── Campaigns/
│   │       ├── Campaigns.tsx
│   │       └── index.ts
│   ├── Admin/
│   │   └── Dashboard/
│   │       ├── Dashboard.tsx
│   │       └── index.ts
│   └── Settings/
│       ├── Settings.tsx
│       └── index.ts
│
├── routes/             # Configuração de rotas
│   ├── index.tsx
│   ├── routes.tsx
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
│
├── services/           # Serviços organizados por funcionalidade
│   ├── core/
│   │   ├── api.ts              # Configuração base da API (axios)
│   │   └── interceptors.ts
│   ├── auth/
│   │   └── authService.ts
│   ├── channels/
│   │   └── channelsService.ts
│   ├── contacts/
│   │   └── contactsService.ts
│   ├── chat/
│   │   └── conversationsService.ts
│   ├── campaigns/
│   │   └── campaignsService.ts
│   ├── notifications/
│   │   └── notificationsService.ts
│   └── teams/
│       └── teamsService.ts
│
├── types/              # Tipos e interfaces TypeScript
│   ├── auth/
│   │   └── auth.types.ts
│   ├── chat/
│   │   ├── conversation.types.ts
│   │   └── message.types.ts
│   ├── contacts/
│   │   └── contact.types.ts
│   ├── channels/
│   │   └── channel.types.ts
│   ├── campaigns/
│   │   └── campaign.types.ts
│   ├── api.types.ts            # Tipos genéricos de API
│   └── global.d.ts             # Tipos globais
│
├── utils/              # Funções utilitárias organizadas por categoria
│   ├── time/
│   │   ├── formatDate.ts
│   │   └── timeAgo.ts
│   ├── validation/
│   │   ├── validators.ts
│   │   └── schemas.ts
│   ├── format/
│   │   ├── formatPhone.ts
│   │   └── formatCurrency.ts
│   ├── chat/
│   │   ├── avatarHelpers.ts
│   │   └── messageHelpers.ts
│   ├── contacts/
│   │   └── contactHelpers.ts
│   ├── campaigns/
│   │   └── campaignHelpers.ts
│   └── string/
│       ├── truncate.ts
│       └── sanitize.ts
│
├── constants/          # Constantes e configurações
│   ├── app.constants.ts
│   ├── api.constants.ts
│   └── routes.constants.ts
│
└── styles/             # Estilos globais e configurações CSS
    ├── globals.css
    └── tailwind.css
```

---

## 🎯 Convenções de Organização

### 🚫 REGRA DE OURO

```
┌──────────────────────────────────────────────────────────────┐
│  "/pages contém APENAS componentes de página (rotas)"        │
│  "TUDO mais vai para pastas globais organizadas por domínio" │
│  "Componentes → /components/features/[feature]"              │
│  "Hooks → /hooks/[feature]"                                  │
│  "Utils → /utils/[feature]"                                  │
│  "Types → /types/[feature]"                                  │
│  "Services → /services/[feature]"                            │
│  "SEMPRE verificar se já existe antes de criar!"             │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Regras Absolutas

### 1. Páginas (`/pages`)

**✅ ÚNICA estrutura permitida:**
```
pages/Example/
├── Example.tsx          # APENAS componente da página
└── index.ts             # Export
```

**❌ NUNCA ter em `/pages`:**
- ❌ `components/` → SEMPRE em `/components/features/[feature]`
- ❌ `types/` → SEMPRE em `/types/[feature]`
- ❌ `hooks/` → SEMPRE em `/hooks/[feature]`
- ❌ `services/` → SEMPRE em `/services/[feature]`
- ❌ `utils/` → SEMPRE em `/utils/[feature]`
- ❌ `constants/` → SEMPRE em `/constants/` ou `/types/[feature]/constants.ts`
- ❌ `contexts/` → SEMPRE em `/contexts/`

**REGRA**: `/pages` contém APENAS componentes de rota (páginas). NADA MAIS!

---

### 2. Componentes (`/components`)

**✅ TODOS os componentes devem estar em `/components`:**
- Componentes de UI genéricos → `/components/base`
- Componentes de layout → `/components/layout`
- Componentes compartilhados → `/components/shared`
- Componentes de features → `/components/features/[feature-name]`

**❌ NUNCA em `/pages`:**
- `/pages` deve conter APENAS componentes de página (rotas)
- Componentes específicos de uma feature → `/components/features/[feature]`
- Mesmo componentes usados em UMA só página → `/components/features/[feature]`

#### Exemplo Correto:

```tsx
// ✅ BOM: src/components/features/chat/ConversationList.tsx
export function ConversationList() {
  // Componente específico do Chat (mesmo se usado em 1 lugar só)
}

// ✅ BOM: src/components/base/EmptyState.tsx
export function EmptyState({ icon, title, description }) {
  // Componente genérico reutilizável
}
```

#### Exemplo Errado:

```tsx
// ❌ ERRADO: src/pages/Customer/Chat/components/ConversationList.tsx
// NUNCA colocar componentes dentro de /pages!
```

---

### 3. Hooks (`/hooks`)

**✅ TODOS os hooks devem estar em `/hooks`:**
- Hooks genéricos → `/hooks/` (raiz: `useDarkMode.ts`, `useLanguage.ts`)
- Hooks específicos de feature → `/hooks/[feature]`

**❌ NUNCA em `/pages`:**
- TODOS os hooks devem estar em `/hooks`
- Hooks específicos de feature → `/hooks/[feature]`
- Mesmo hooks usados em 1 lugar só → `/hooks/[feature]`

#### Exemplo Correto:

```typescript
// ✅ BOM: src/hooks/chat/useChatActions.ts
export function useChatActions() {
  // Específico do Chat, mas na estrutura global
}

// ✅ BOM: src/hooks/useDarkMode.ts
export function useDarkMode() {
  // Hook genérico na raiz
}
```

#### Exemplo Errado:

```typescript
// ❌ ERRADO: src/pages/Customer/Chat/hooks/useSpecificChatLogic.ts
// NUNCA colocar hooks dentro de /pages!
```

---

### 4. Utils (`/utils`)

**✅ TODOS os utils devem estar em `/utils`:**
- Utils genéricos → `/utils/[categoria]` (`time/`, `validation/`, `format/`, `string/`)
- Utils específicos de feature → `/utils/[feature]`

**❌ NUNCA em `/pages`:**
- TODOS os utils devem estar em `/utils`
- Utils específicos de feature → `/utils/[feature]`
- Mesmo utils usados em 1 lugar só → `/utils/[feature]`

#### Exemplo Correto:

```typescript
// ✅ BOM: src/utils/chat/avatarHelpers.ts
export function getAvatarInitials(name: string): string {
  // Específico de chat, mas na estrutura global
}

// ✅ BOM: src/utils/time/formatDate.ts
export function formatDate(date: Date): string {
  // Util genérico de formatação
}
```

#### Exemplo Errado:

```typescript
// ❌ ERRADO: src/pages/Customer/Chat/utils/someHelper.ts
// NUNCA colocar utils dentro de /pages!
```

---

### 5. Types (`/types`)

**✅ TODOS os types devem estar em `/types`:**
- Types genéricos → `/types/` (raiz: `api.types.ts`, `global.d.ts`)
- Types específicos de feature → `/types/[feature]`

**❌ NUNCA em `/pages`:**
- TODOS os types devem estar em `/types`
- Types específicos de feature → `/types/[feature]`
- Types compartilhados → `/types/[feature]` (não na raiz se específico)

#### Exemplo Correto:

```typescript
// ✅ BOM: src/types/chat/conversation.types.ts
export interface Conversation {
  id: string;
  // ...
}

// ✅ BOM: src/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  // ...
}
```

#### Exemplo Errado:

```typescript
// ❌ ERRADO: src/pages/Customer/Chat/types.ts
// NUNCA colocar types dentro de /pages!
```

---

### 6. Services (`/services`)

**✅ TODOS os services devem estar em `/services`:**
- Configuração base → `/services/core/` (`api.ts`, `interceptors.ts`)
- Services específicos de feature → `/services/[feature]`

**❌ NUNCA em `/pages`:**
- TODOS os services devem estar em `/services`
- Services específicos de feature → `/services/[feature]`

#### Exemplo Correto:

```typescript
// ✅ BOM: src/services/chat/conversationsService.ts
export const conversationsService = {
  getAll: () => api.get('/conversations'),
  // ...
};

// ✅ BOM: src/services/core/api.ts
export const api = axios.create({ /* config */ });
```

#### Exemplo Errado:

```typescript
// ❌ ERRADO: src/pages/Customer/Chat/services/chatService.ts
// NUNCA colocar services dentro de /pages!
```

---

## 📝 Guia de Onde Colocar Cada Tipo de Arquivo

### Checklist de Decisão

**Para COMPONENTES:**
- [ ] É um componente de página (rota)? → `/pages/[Section]/[Page].tsx`
- [ ] É um componente genérico de UI? → `/components/base/[ComponentName]`
- [ ] É um componente de layout? → `/components/layout/[ComponentName]`
- [ ] É compartilhado entre features? → `/components/shared/[ComponentName]`
- [ ] É específico de uma feature? → `/components/features/[feature]/[ComponentName]`

**Para HOOKS:**
- [ ] É um hook genérico (tema, idioma, etc.)? → `/hooks/[hookName].ts`
- [ ] É específico de uma feature? → `/hooks/[feature]/[hookName].ts`

**Para UTILS:**
- [ ] É uma função de formatação genérica? → `/utils/format/[utilName].ts`
- [ ] É uma função de validação? → `/utils/validation/[utilName].ts`
- [ ] É uma função de manipulação de tempo? → `/utils/time/[utilName].ts`
- [ ] É uma função de manipulação de string? → `/utils/string/[utilName].ts`
- [ ] É específico de uma feature? → `/utils/[feature]/[utilName].ts`

**Para TYPES:**
- [ ] São tipos genéricos de API? → `/types/api.types.ts`
- [ ] São tipos globais? → `/types/global.d.ts`
- [ ] São específicos de uma feature? → `/types/[feature]/[typeName].types.ts`

**Para SERVICES:**
- [ ] É configuração base da API? → `/services/core/api.ts`
- [ ] São interceptors? → `/services/core/interceptors.ts`
- [ ] É específico de uma feature? → `/services/[feature]/[serviceName]Service.ts`

**Para CONTEXTS:**
- [ ] É um contexto global? → `/contexts/[ContextName]Context.tsx`

**Para CONSTANTES:**
- [ ] São constantes globais da aplicação? → `/constants/app.constants.ts`
- [ ] São constantes de API? → `/constants/api.constants.ts`
- [ ] São constantes de rotas? → `/constants/routes.constants.ts`

---

## 🏷️ Padrões de Nomenclatura

### Arquivos e Pastas

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| **Componentes React** | PascalCase | `ConversationList.tsx`, `ChatSidebar.tsx` |
| **Páginas** | PascalCase | `Chat.tsx`, `Contacts.tsx` |
| **Hooks** | camelCase com prefixo `use` | `useChatActions.ts`, `useAuth.ts` |
| **Utils** | camelCase | `formatDate.ts`, `avatarHelpers.ts` |
| **Types** | camelCase com sufixo `.types` | `conversation.types.ts`, `api.types.ts` |
| **Services** | camelCase com sufixo `Service` | `conversationsService.ts`, `authService.ts` |
| **Contexts** | PascalCase com sufixo `Context` | `AuthContext.tsx`, `ThemeContext.tsx` |
| **Constants** | camelCase com sufixo `.constants` | `app.constants.ts`, `api.constants.ts` |
| **Pastas** | kebab-case | `features/`, `chat/`, `contact-form/` |

### Variáveis e Funções

```typescript
// ✅ Componentes: PascalCase
export function ConversationList() { }

// ✅ Hooks: camelCase com prefixo 'use'
export function useChatActions() { }

// ✅ Funções: camelCase
export function formatDate(date: Date) { }

// ✅ Constantes: UPPER_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com';

// ✅ Interfaces/Types: PascalCase
export interface Conversation { }
export type ConversationStatus = 'open' | 'closed';

// ✅ Variáveis: camelCase
const conversationId = '123';
```

---

## ✨ Boas Práticas

### Path Aliases

**SEMPRE use path aliases com `@/` ao invés de paths relativos:**

```typescript
// ❌ EVITE paths relativos
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// ✅ USE path aliases com @/
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
```

**Aliases configurados:**
- `@/` → `src/`
- `@/components` → `src/components`
- `@/contexts` → `src/contexts`
- `@/hooks` → `src/hooks`
- `@/services` → `src/services`
- `@/pages` → `src/pages`
- `@/types` → `src/types`
- `@/utils` → `src/utils`
- `@/styles` → `src/styles`
- `@/assets` → `src/assets`

### Imports

**Organize imports em ordem:**

```typescript
// 1. Imports de bibliotecas externas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Imports de componentes do design system
import { Button, Input, Modal } from '@/components/ui';

// 3. Imports de componentes locais
import { ConversationList } from '@/components/features/chat/ConversationList';

// 4. Imports de hooks
import { useAuth } from '@/contexts/AuthContext';
import { useChatActions } from '@/hooks/chat/useChatActions';

// 5. Imports de services
import { conversationsService } from '@/services/chat/conversationsService';

// 6. Imports de types
import type { Conversation } from '@/types/chat/conversation.types';

// 7. Imports de utils e constants
import { formatDate } from '@/utils/time/formatDate';
import { API_BASE_URL } from '@/constants/api.constants';

// 8. Imports de estilos
import './styles.css';
```

### Tipagem TypeScript

**SEMPRE use TypeScript para tudo:**

```typescript
// ✅ BOM: Componente com tipagem completa
interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  onSelect,
  loading = false
}: ConversationListProps) {
  // ...
}

// ✅ BOM: Hook com tipagem de retorno
export function useChatActions(): {
  sendMessage: (message: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
} {
  // ...
}

// ❌ EVITE: Sem tipagem
export function ConversationList({ conversations, onSelect }) {
  // ...
}
```

### Componentização

**Siga o princípio da responsabilidade única:**

```typescript
// ✅ BOM: Componente focado e pequeno
export function ConversationListItem({ conversation, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(conversation.id)}>
      <h3>{conversation.title}</h3>
      <p>{conversation.lastMessage}</p>
    </div>
  );
}

// ❌ EVITE: Componente fazendo muitas coisas
export function ConversationPage() {
  // Gerencia estado, faz fetching, renderiza lista, sidebar, header...
  // 500 linhas de código
}
```

### Reutilização

**SEMPRE verifique se já existe antes de criar:**

```bash
# Antes de criar um novo componente
npm run dev  # Abra o projeto
# Navegue em /components para ver o que já existe

# Antes de criar um novo hook
# Verifique /hooks para ver se já existe algo similar

# Antes de criar um novo util
# Verifique /utils para ver se já existe algo similar
```

### Testes

**Escreva testes para componentes críticos:**

```typescript
// src/components/features/chat/ConversationList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from './ConversationList';

describe('ConversationList', () => {
  it('should render conversations', () => {
    const conversations = [
      { id: '1', title: 'Test Conversation' }
    ];
    render(<ConversationList conversations={conversations} onSelect={jest.fn()} />);

    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });
});
```

---

## 🔄 Fluxo de Desenvolvimento

### 1. Antes de Começar

```bash
# Atualize sua branch
git checkout main
git pull origin main

# Crie uma nova branch
git checkout -b feature/nome-da-feature

# Instale dependências (se necessário)
pnpm install
```

### 2. Durante o Desenvolvimento

```bash
# Execute o servidor de desenvolvimento
pnpm run dev

# Execute os testes em watch mode
pnpm run test:watch

# Execute o linter
pnpm run eslint
```

### 3. Antes de Commitar

```bash
# Execute o linter e corrija problemas
pnpm run eslint:fix

# Execute todos os testes
pnpm run test

# Execute a build para verificar erros de TypeScript
pnpm run build
```

### 4. Commit e Push

```bash
# Adicione as mudanças
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona componente ConversationList"

# Push para o repositório
git push origin feature/nome-da-feature
```

### 5. Pull Request

1. Abra um Pull Request no GitHub
2. Descreva as mudanças realizadas
3. Adicione screenshots (se aplicável)
4. Aguarde review

---

## 📚 Referências

- [README.md](./README.md) - Informações gerais do projeto
- [Documentação do React](https://react.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/)
- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do TailwindCSS](https://tailwindcss.com/)
- [Guia de Análise e Organização de Código](../../../Documentações/EvoAI%20Services/09-evo-ai-frontend/08-analise-organizacao-codigo.md)

---

## 🆘 Dúvidas?

Se tiver dúvidas sobre onde colocar um arquivo ou como organizar seu código:

1. Consulte este documento
2. Verifique a estrutura existente em `/src`
3. Pergunte ao time no canal #frontend

---

**Versão:** 1.0.0
**Última atualização:** 23/12/2025
**Mantido por:** Equipe EvoAI Frontend
