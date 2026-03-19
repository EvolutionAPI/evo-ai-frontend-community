import { MessageCircle } from 'lucide-react';
import type { DashboardApp } from '@/types/integrations';
import { useLanguage } from '@/hooks/useLanguage';

interface ChatTabsProps {
  dashboardApps: DashboardApp[];
  activeTab: string; // 'chat' or app.id
  onTabChange: (tabId: string) => void;
  conversationSelected: boolean;
}

const ChatTabs = ({ dashboardApps, activeTab, onTabChange, conversationSelected }: ChatTabsProps) => {
  const { t } = useLanguage('chat');

  if (!conversationSelected) {
    return null;
  }

  // Filter for conversation type apps only
  const conversationApps = dashboardApps.filter(app => app.display_type === 'conversation');

  // If no conversation apps, don't show tabs
  if (conversationApps.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b bg-background">
      {/* Chat Tab */}
      <button
        onClick={() => onTabChange('chat')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
          ${
            activeTab === 'chat'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }
        `}
      >
        <MessageCircle className="h-4 w-4" />
        {t('chatTabs.chat')}
      </button>

      {/* Dashboard App Tabs */}
      {conversationApps.map(app => (
        <button
          key={app.id}
          onClick={() => onTabChange(app.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${
              activeTab === app.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }
          `}
        >
          {app.title}
        </button>
      ))}
    </div>
  );
};

export default ChatTabs;
