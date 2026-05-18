import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Mail, MailOpen, HardDrive, KeyRound, MessageSquare, Sparkles, Puzzle, Globe } from 'lucide-react';

interface NavItem {
  key: string;
  path: string;
  icon: typeof Mail;
  /** Quando preenchido, sobrescreve t('navigation.<key>') — útil pra items sem i18n ainda */
  label?: string;
  /** Badge opcional (ex: "BETA") */
  badge?: string;
}

const navItems: readonly NavItem[] = [
  { key: 'email', path: '/settings/admin/email', icon: Mail },
  { key: 'storage', path: '/settings/admin/storage', icon: HardDrive },
  { key: 'socialLogin', path: '/settings/admin/social-login', icon: KeyRound },
  { key: 'channels', path: '/settings/admin/channels', icon: MessageSquare },
  { key: 'openai', path: '/settings/admin/openai', icon: Sparkles },
  { key: 'skyway', path: '/settings/admin/skyway', icon: Sparkles, label: 'Skyway', badge: 'NOVO' },
  { key: 'integrations', path: '/settings/admin/integrations', icon: Puzzle },
  { key: 'inboundEmail', path: '/settings/admin/inbound-email', icon: MailOpen },
  { key: 'frontendRuntime', path: '/settings/admin/frontend-runtime', icon: Globe },
];

export default function AdminSettingsLayout() {
  const { t } = useLanguage('adminSettings');
  const location = useLocation();

  if (location.pathname === '/settings/admin' || location.pathname === '/settings/admin/') {
    return <Navigate to="/settings/admin/email" replace />;
  }

  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 border-r border-sidebar-border p-4">
        <h3 className="text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4">
          {t('title')}
        </h3>
        <nav className="space-y-1">
          {navItems.map(({ key, path, icon: Icon, label, badge }) => (
            <NavLink
              key={key}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label ?? t(`navigation.${key}`)}</span>
              {badge && (
                <span className="text-[9px] font-semibold uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded ring-1 ring-primary/30">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
