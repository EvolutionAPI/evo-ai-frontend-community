import React from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@evoapi/design-system/button';
import { useLanguage } from '@/hooks/useLanguage';

interface NoConversationsProps {
  onCreateNew?: () => void;
  searchTerm?: string;
}

const NoConversations: React.FC<NoConversationsProps> = ({ onCreateNew, searchTerm }) => {
  const { t } = useLanguage('chat');
  const isSearchResult = searchTerm && searchTerm.trim().length > 0;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {isSearchResult
          ? t('emptyStates.noConversations.title.search')
          : t('emptyStates.noConversations.title.default')}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-sm">
        {isSearchResult
          ? t('emptyStates.noConversations.description.search', { searchTerm: searchTerm || '' })
          : t('emptyStates.noConversations.description.default')}
      </p>

      {!isSearchResult && onCreateNew && (
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('emptyStates.noConversations.createNew')}
        </Button>
      )}
    </div>
  );
};

export default NoConversations;
