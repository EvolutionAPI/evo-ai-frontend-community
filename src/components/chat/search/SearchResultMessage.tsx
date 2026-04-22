import { CommandItem } from '@evoapi/design-system';
import { MessageCircle } from 'lucide-react';
import type { SearchMessageResult } from '@/types/chat/search';
import { highlightMatch } from './searchHighlight';

interface Props {
  item: SearchMessageResult;
  query: string;
  onSelect: (item: SearchMessageResult) => void;
}

export default function SearchResultMessage({ item, query, onSelect }: Props) {
  const senderName = item.sender?.available_name || item.sender?.name || 'Unknown';
  const inboxName = item.inbox?.name;
  const content = item.content ?? '';

  return (
    <CommandItem
      value={`message-${item.id}`}
      onSelect={() => onSelect(item)}
      className="flex items-start gap-3 py-2 cursor-pointer"
    >
      <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        {content && (
          <p className="text-sm line-clamp-2">{highlightMatch(content, query)}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{senderName}</span>
          {item.conversation_id != null && <span>· #{item.conversation_id}</span>}
          {inboxName && <span className="truncate">· {inboxName}</span>}
        </div>
      </div>
    </CommandItem>
  );
}
