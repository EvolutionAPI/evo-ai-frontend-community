import React from 'react';
import { Button } from '@evoapi/design-system';
import { ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface ChannelBreadcrumbProps {
  items: BreadcrumbItem[];
  onBack?: () => void;
  className?: string;
}

const ChannelBreadcrumb: React.FC<ChannelBreadcrumbProps> = ({
  items,
  onBack,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 py-4 ${className}`}>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span>/</span>}
            <span
              className={`${
                item.active
                  ? 'text-sidebar-foreground'
                  : item.onClick
                  ? 'cursor-pointer hover:text-sidebar-foreground'
                  : ''
              }`}
              onClick={item.onClick}
            >
              {item.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ChannelBreadcrumb;
