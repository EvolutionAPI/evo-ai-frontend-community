import React from 'react';
import {
  Button,
  Badge,
} from '@evoapi/design-system';

interface CollapsibleHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}

const CollapsibleHeader = ({
  title,
  description,
  icon,
  count,
  isOpen,
  onToggle,
}: CollapsibleHeaderProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {count > 0 && (
        <Badge variant="secondary" className="ml-2">
          {count}
        </Badge>
      )}
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="p-1"
    >
      <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>↓</div>
    </Button>
  </div>
);

export default CollapsibleHeader;
