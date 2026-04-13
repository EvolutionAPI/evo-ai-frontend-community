import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@evoapi/design-system';

interface TooltipInfoProps {
  title: string;
  content: string;
}

export function TooltipInfo({ title, content }: TooltipInfoProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help text-primary/60 hover:text-primary transition-colors shrink-0">
            <HelpCircle className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] p-3" side="top">
          <p className="font-semibold text-sm mb-1">{title}</p>
          <p className="text-xs leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
