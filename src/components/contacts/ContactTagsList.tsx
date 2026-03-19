import { Badge } from '@evoapi/design-system';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactLabel } from '@/types/contacts';

interface ContactTagsListProps {
  labels?: (string | ContactLabel)[];
  maxVisible?: number;
  size?: 'sm' | 'md';
}

export default function ContactTagsList({
  labels = [],
  maxVisible = 3,
  size = 'sm'
}: ContactTagsListProps) {
  if (!labels || labels.length === 0) {
    return null;
  }

  const visibleLabels = labels.slice(0, maxVisible);
  const remainingCount = labels.length - maxVisible;

  const getLabelData = (label: string | ContactLabel) => {
    if (typeof label === 'string') {
      return { name: label, color: '#1f93ff' };
    }
    return label;
  };

  const getBadgeStyle = (color: string) => {
    // Convert hex to rgba for background
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
      color: color,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`
    };
  };

  const badgeSize = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2 py-1';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleLabels.map((label, index) => {
        const labelData = getLabelData(label);
        return (
          <Badge
            key={`${labelData.name}-${index}`}
            variant="secondary"
            className={cn(
              `flex items-center gap-1 border`,
              badgeSize
            )}
            style={getBadgeStyle(labelData.color)}
          >
            <Tag className={iconSize} />
            <span>{labelData.name}</span>
          </Badge>
        );
      })}

      {remainingCount > 0 && (
        <Badge
          variant="outline"
          className={cn(badgeSize, "text-muted-foreground")}
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
