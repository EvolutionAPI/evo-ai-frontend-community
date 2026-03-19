# Components/Layout

Esta pasta contém componentes de layout que definem a estrutura e organização visual da aplicação.

## Propósito

Armazenar componentes responsáveis pela estrutura e organização da interface do usuário:

- Componentes que definem o layout geral da aplicação
- Elementos estruturais recorrentes (Header, Footer, Sidebar, etc.)
- Containers e organizadores de conteúdo
- Layouts de página reutilizáveis

## Convenções

- Cada componente deve estar em seu próprio arquivo/pasta
- Use PascalCase para nomes de componentes e arquivos (ex: `Header.tsx`, `Sidebar.tsx`)
- Mantenha a lógica de negócio separada dos componentes de layout
- Componentes de layout devem ser focados em posicionamento e estrutura
- Utilize os componentes UI como blocos de construção
- Utilize TypeScript para definição de props e tipos
- Faça uso do design system para estilização e tokens
- **SEMPRE use path aliases `@/` para imports - nunca paths relativos `../`**

### Path Aliases nos Componentes
```typescript
// ❌ Evite paths relativos
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../layout/NotificationBell';

// ✅ Use path aliases com @/
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/layout/NotificationBell';
```

## Estrutura de Arquivos

```
layout/
  ├── MainLayout.tsx              # Layout principal com sidebar e submenus
  ├── OrganizationSwitcher.tsx    # Switcher de organizações/accounts
  ├── NotificationBell.tsx        # Sino de notificações
  ├── NotificationPanel.tsx       # Painel de notificações
  ├── NotificationItem.tsx        # Item individual de notificação
  └── README.md                   # Documentação dos componentes
```

## Componentes Implementados

### MainLayout.tsx
Layout principal da aplicação com:
- **Sidebar colapsível** com navegação principal
- **Header** com logo, organizações switcher e notificações
- **Submenus** para Settings e Reports (segunda sidebar)
- **Suporte a multi-tenancy** com organizações
- **Sistema de notificações** integrado
- **Dark/Light mode** automático

### OrganizationSwitcher.tsx
Componente para troca de organizações:
- **Dropdown** com lista de organizações do usuário
- **Busca** por organizações
- **Indicação visual** da organização ativa
- **Roles** do usuário em cada organização

### Sistema de Notificações
- **NotificationBell**: Sino com contador de não lidas
- **NotificationPanel**: Painel com lista paginada
- **NotificationItem**: Item individual com formatação
- **WebSocket**: Notificações em tempo real

## Exemplos de Uso

```tsx
// App.tsx - Configuração principal
import MainLayout from '@/components/layout/MainLayout';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

function App() {
  return (
    <AuthProvider>
      <OrganizationsProvider>
        <NotificationsProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={
              <MainLayout>
                <AppRoutes />
              </MainLayout>
            } />
          </Routes>
        </NotificationsProvider>
      </OrganizationsProvider>
    </AuthProvider>
  );
}
```

### Navegação com Submenus

O MainLayout gerencia automaticamente os submenus:

```typescript
// Configuração de menu com submenus
{
  name: 'Configurações',
  href: '/settings',
  icon: Cog,
  subItems: [
    { name: 'Conta', href: '/settings/account', icon: User },
    { name: 'Usuários', href: '/settings/users', icon: Users2 },
    { name: 'Times', href: '/settings/teams', icon: Clock },
  ],
}
```

**Comportamento automático:**
- Navegação para `/settings/*` → Submenu abre automaticamente
- Navegação para fora → Submenu fecha automaticamente
- Clique no menu → Abre submenu + navega para primeiro item

## Manutenção

- Mantenha os layouts simples e flexíveis para diferentes tipos de conteúdo
- Use composição para criar layouts complexos a partir de componentes simples
- Considere a responsividade em todos os componentes de layout
- Teste os layouts em diferentes tamanhos de tela
- Mantenha consistência visual entre os diferentes layouts
- Documente variações e casos de uso especiais
