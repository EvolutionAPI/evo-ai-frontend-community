import { CommandItem } from '@evoapi/design-system';
import { User } from 'lucide-react';
import type { SearchContactResult } from '@/types/chat/search';
import { highlightMatch } from './searchHighlight';

interface Props {
  item: SearchContactResult;
  query: string;
  onSelect: (item: SearchContactResult) => void;
}

export default function SearchResultContact({ item, query, onSelect }: Props) {
  const secondary = item.email || item.phone_number || item.identifier || '';

  return (
    <CommandItem
      value={`contact-${item.id}`}
      onSelect={() => onSelect(item)}
      className="flex items-start gap-3 py-2 cursor-pointer"
    >
      <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{highlightMatch(item.name, query)}</div>
        {secondary && (
          <p className="text-xs text-muted-foreground truncate">
            {highlightMatch(secondary, query)}
          </p>
        )}
      </div>
    </CommandItem>
  );
}
