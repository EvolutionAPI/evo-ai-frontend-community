import React from 'react';
import { CheckCircle, Clock, MessageCircle, Pause } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@evoapi/design-system/tooltip';
import { useLanguage } from '@/hooks/useLanguage';

interface ConversationStatusIconProps {
  status: string;
  size?: 'sm' | 'md';
}

const ConversationStatusIcon: React.FC<ConversationStatusIconProps> = ({ status, size = 'sm' }) => {
  const { t } = useLanguage('chat');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return {
          icon: MessageCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: t('conversationStatusIcon.open.label'),
          description: t('conversationStatusIcon.open.description'),
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: t('conversationStatusIcon.pending.label'),
          description: t('conversationStatusIcon.pending.description'),
        };
      case 'resolved':
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: t('conversationStatusIcon.resolved.label'),
          description: t('conversationStatusIcon.resolved.description'),
        };
      case 'snoozed':
        return {
          icon: Pause,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: t('conversationStatusIcon.snoozed.label'),
          description: t('conversationStatusIcon.snoozed.description'),
        };
      default:
        return {
          icon: MessageCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: t('conversationStatusIcon.unknown.label'),
          description: t('conversationStatusIcon.unknown.description'),
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const containerSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              ${containerSize} rounded-full ${config.bgColor}
              flex items-center justify-center cursor-help
              hover:scale-110 transition-transform duration-200
            `}
          >
            <Icon className={`${iconSize} ${config.color}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="px-3 py-2 bg-popover border border-border shadow-lg rounded-lg"
        >
          <div className="text-center">
            <div className="text-sm font-semibold text-foreground">{config.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{config.description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConversationStatusIcon;
