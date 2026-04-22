import { CommandItem } from '@evoapi/design-system';
import { MessageSquare } from 'lucide-react';
import type { SearchConversationResult } from '@/types/chat/search';
import { highlightMatch } from './searchHighlight';

interface Props {
  item: SearchConversationResult;
  query: string;
  onSelect: (item: SearchConversationResult) => void;
}

export default function SearchResultConversation({ item, query, onSelect }: Props) {
  const contactName = item.contact?.name ?? 'Unknown contact';
  const snippet = item.message?.content ?? '';
  const inboxName = item.inbox?.name;

  return (
    <CommandItem
      value={`conversation-${item.id}`}
      onSelect={() => onSelect(item)}
      className="flex items-start gap-3 py-2 cursor-pointer"
    >
      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{highlightMatch(contactName, query)}</span>
          <span className="text-xs text-muted-foreground shrink-0">#{item.display_id}</span>
        </div>
        {snippet && (
          <p className="text-xs text-muted-foreground truncate">{highlightMatch(snippet, query)}</p>
        )}
        {inboxName && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {inboxName}
          </span>
        )}
      </div>
    </CommandItem>
  );
}
