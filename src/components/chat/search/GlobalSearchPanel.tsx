import { useEffect, useRef } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from '@evoapi/design-system';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import useGlobalSearch from '@/hooks/chat/useGlobalSearch';
import SearchResultConversation from './SearchResultConversation';
import SearchResultContact from './SearchResultContact';
import SearchResultMessage from './SearchResultMessage';
import type {
  SearchConversationResult,
  SearchContactResult,
  SearchMessageResult,
} from '@/types/chat/search';

const SECTION_DISPLAY_LIMIT = 5;

interface Props {
  isOpen: boolean;
  searchTerm: string;
  rawInputValue: string;
  onClose: () => void;
  onSelectConversation: (item: SearchConversationResult) => void;
  onSelectContact: (item: SearchContactResult) => void;
  onSelectMessage: (item: SearchMessageResult) => void;
}

export default function GlobalSearchPanel({
  isOpen,
  searchTerm,
  rawInputValue,
  onClose,
  onSelectConversation,
  onSelectContact,
  onSelectMessage,
}: Props) {
  const { t } = useLanguage('chat');
  const panelRef = useRef<HTMLDivElement>(null);
  const { status, error, conversations, contacts, messages, isEmpty, term } =
    useGlobalSearch(searchTerm);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const limitedConversations = conversations.slice(0, SECTION_DISPLAY_LIMIT);
  const limitedContacts = contacts.slice(0, SECTION_DISPLAY_LIMIT);
  const limitedMessages = messages.slice(0, SECTION_DISPLAY_LIMIT);

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden"
      role="dialog"
      aria-label={t('globalSearch.ariaLabel')}
    >
      <Command shouldFilter={false} className="max-h-[60vh]">
        {status === 'loading' && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-b">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>{t('globalSearch.loading')}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="px-3 py-2 text-sm text-destructive border-b">
            {error || t('globalSearch.error')}
          </div>
        )}

        {status === 'idle' && rawInputValue.trim().length > 0 && rawInputValue.trim().length < 2 && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            {t('globalSearch.typeMoreHint')}
          </div>
        )}

        {status === 'idle' && rawInputValue.trim().length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            {t('globalSearch.emptyHint')}
          </div>
        )}

        <CommandList>
          {status === 'success' && isEmpty && (
            <CommandEmpty>{t('globalSearch.noResults')}</CommandEmpty>
          )}

          {status === 'success' && !isEmpty && (
            <>
              <CommandGroup heading={t('globalSearch.sections.conversations')}>
                {limitedConversations.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {t('globalSearch.sections.conversationsEmpty')}
                  </div>
                ) : (
                  limitedConversations.map(item => (
                    <SearchResultConversation
                      key={`conv-${item.id}`}
                      item={item}
                      query={term}
                      onSelect={result => {
                        onSelectConversation(result);
                        onClose();
                      }}
                    />
                  ))
                )}
              </CommandGroup>

              <CommandGroup heading={t('globalSearch.sections.contacts')}>
                {limitedContacts.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {t('globalSearch.sections.contactsEmpty')}
                  </div>
                ) : (
                  limitedContacts.map(item => (
                    <SearchResultContact
                      key={`contact-${item.id}`}
                      item={item}
                      query={term}
                      onSelect={result => {
                        onSelectContact(result);
                        onClose();
                      }}
                    />
                  ))
                )}
              </CommandGroup>

              <CommandGroup heading={t('globalSearch.sections.messages')}>
                {limitedMessages.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {t('globalSearch.sections.messagesEmpty')}
                  </div>
                ) : (
                  limitedMessages.map(item => (
                    <SearchResultMessage
                      key={`msg-${item.id}`}
                      item={item}
                      query={term}
                      onSelect={result => {
                        onSelectMessage(result);
                        onClose();
                      }}
                    />
                  ))
                )}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
