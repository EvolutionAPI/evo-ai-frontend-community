import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const NoMessages: React.FC = () => {
  const { t } = useLanguage('chat');
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-0">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{t('emptyStates.noMessages.title')}</h3>

      <p className="text-muted-foreground mb-6 max-w-sm">
        {t('emptyStates.noMessages.description')}
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Send className="w-4 h-4" />
        {t('emptyStates.noMessages.hint')}
      </div>
    </div>
  );
};

export default NoMessages;
