import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Button,
  Badge,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@evoapi/design-system';
import {
  Plus,
  X,
  Check,
  Tag,
} from 'lucide-react';
import { ContactLabel } from '@/types/contacts';

interface Label {
  id: string;
  title: string;
  description?: string;
  color: string;
  show_on_sidebar: boolean;
}

interface ContactLabelsProps {
  contactId?: string;
  labels: (string | ContactLabel)[];
  onLabelsChange: (labels: string[]) => void;
  availableLabels?: Label[];
  disabled?: boolean;
}

export default function ContactLabels({
  labels,
  onLabelsChange,
  availableLabels = [],
  disabled = false,
}: ContactLabelsProps) {
  const { t } = useLanguage('contacts');
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Helper function to get label name from either string or ContactLabel object
  const getLabelName = (label: string | ContactLabel): string => {
    return typeof label === 'string' ? label : label.name;
  };

  // Helper function to check if a label exists in the list
  const hasLabel = (labelTitle: string): boolean => {
    return labels.some(label => getLabelName(label) === labelTitle);
  };

  const handleLabelToggle = (labelTitle: string) => {
    if (hasLabel(labelTitle)) {
      // Remove label - convert remaining labels to strings
      const filteredLabels = labels.filter(l => getLabelName(l) !== labelTitle);
      onLabelsChange(filteredLabels.map(getLabelName));
    } else {
      // Add label - convert all labels to strings
      onLabelsChange([...labels.map(getLabelName), labelTitle]);
    }
  };

  const handleRemoveLabel = (labelTitle: string) => {
    const filteredLabels = labels.filter(l => getLabelName(l) !== labelTitle);
    onLabelsChange(filteredLabels.map(getLabelName));
  };

  const getColorClasses = (color: string) => {
    // Convert hex color to Tailwind classes or use inline style
    return {
      backgroundColor: color,
      borderColor: color,
    };
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {labels.map((labelItem, index) => {
          const labelTitle = getLabelName(labelItem);
          const label = availableLabels.find(l => l.title === labelTitle);
          return (
            <Badge
              key={`${labelTitle}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
              style={label ? getColorClasses(label.color) : undefined}
            >
              <Tag className="h-3 w-3" />
              <span className="text-xs">{labelTitle}</span>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveLabel(labelTitle)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          );
        })}

        {!disabled && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('labels.add')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder={t('labels.search')}
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>{t('labels.empty')}</CommandEmpty>
                  <CommandGroup>
                    {availableLabels
                      .filter(label =>
                        label.title.toLowerCase().includes(searchValue.toLowerCase())
                      )
                      .map((label) => (
                        <CommandItem
                          key={label.id}
                          value={label.title}
                          onSelect={() => {
                            handleLabelToggle(label.title);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: label.color }}
                            />
                            <span>{label.title}</span>
                            {label.description && (
                              <span className="text-xs text-muted-foreground">
                                {label.description}
                              </span>
                            )}
                          </div>
                          <Check
                            className={`ml-auto h-4 w-4 ${
                              hasLabel(label.title) ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
