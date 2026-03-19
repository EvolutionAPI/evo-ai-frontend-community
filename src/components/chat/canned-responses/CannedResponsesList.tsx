import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@evoapi/design-system/card';
import { Hash, Loader2, Search, Paperclip } from 'lucide-react';
import type { CannedResponse } from '@/types/knowledge';
import { useLanguage } from '@/hooks/useLanguage';

interface CannedResponsesListProps {
  cannedResponses: CannedResponse[];
  selectedIndex: number;
  searchQuery: string;
  isLoading?: boolean;
  onSelect: (cannedResponse: CannedResponse) => void;
}

const CannedResponsesList: React.FC<CannedResponsesListProps> = ({
  cannedResponses,
  selectedIndex,
  searchQuery,
  isLoading = false,
  onSelect,
}) => {
  const { t } = useLanguage('chat');
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o item selecionado
  useEffect(() => {
    if (selectedItemRef.current && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const itemRect = selectedItemRef.current.getBoundingClientRect();

      // Se o item está fora da view, rola para ele
      if (itemRect.bottom > listRect.bottom) {
        selectedItemRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
      } else if (itemRect.top < listRect.top) {
        selectedItemRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Função para destacar o termo pesquisado
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-foreground">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          ),
        )}
      </span>
    );
  };

  // Truncar conteúdo para preview
  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <Card className="absolute bottom-full left-0 right-0 mb-2 shadow-lg border-border z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{t('cannedResponses.loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cannedResponses.length === 0) {
    return (
      <Card className="absolute bottom-full left-0 right-0 mb-2 shadow-lg border-border z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Search className="h-8 w-8" />
            <div className="text-center">
              <p className="text-sm font-medium">{t('cannedResponses.noResults')}</p>
              {searchQuery && (
                <p className="text-xs mt-1">{t('cannedResponses.tryAnotherTerm')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute bottom-full left-0 right-0 mb-2 shadow-lg border-border z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('cannedResponses.title')}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {cannedResponses.length}{' '}
              {cannedResponses.length === 1
                ? t('cannedResponses.result')
                : t('cannedResponses.results')}
            </span>
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('cannedResponses.searchingFor')} <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Lista de Canned Responses */}
        <div
          ref={listRef}
          className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          {cannedResponses.map((cannedResponse, index) => {
            const isSelected = index === selectedIndex;

            return (
              <div
                key={cannedResponse.id}
                ref={isSelected ? selectedItemRef : null}
                className={`
                  px-4 py-3 cursor-pointer transition-all duration-150
                  border-b border-border last:border-b-0
                  ${
                    isSelected
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-muted/50 border-l-4 border-l-transparent'
                  }
                `}
                onClick={() => onSelect(cannedResponse)}
                onMouseEnter={() => {
                  // Mouse hover atualiza seleção visualmente
                  // mas não interfere com navegação por teclado
                }}
              >
                {/* Short Code */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`
                    text-sm font-mono font-semibold
                    ${isSelected ? 'text-primary' : 'text-foreground'}
                  `}
                  >
                    /{highlightMatch(cannedResponse.short_code, searchQuery)}
                  </span>

                  {/* 🎯 ATTACHMENTS INDICATOR: Mostrar ícone se tem mídia */}
                  {cannedResponse.attachments && cannedResponse.attachments.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                      <Paperclip className="h-3 w-3" />
                      <span>{cannedResponse.attachments.length}</span>
                    </span>
                  )}
                </div>

                {/* Content Preview */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {highlightMatch(truncateContent(cannedResponse.content), searchQuery)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer com dicas de navegação */}
        <div className="px-4 py-2 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                  ↑↓
                </kbd>
                {t('cannedResponses.navigate')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                  Enter
                </kbd>
                {t('cannedResponses.select')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">
                  Esc
                </kbd>
                {t('cannedResponses.close')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CannedResponsesList;
