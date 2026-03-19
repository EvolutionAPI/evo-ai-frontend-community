import React, { useState, useEffect } from 'react';

import { Avatar, AvatarImage, AvatarFallback } from '@evoapi/design-system/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@evoapi/design-system/tooltip';

import { MessageCircle } from 'lucide-react';
import { Contact } from '@/types/chat/api';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getContactAvatarUrl,
  getContactInitials,
  getContactAvatarColor,
} from '@/utils/chat/avatarHelpers';
import ChannelIcon from '@/components/channels/ChannelIcon';

// Tipo genérico para qualquer contato com avatar
interface AvatarContact {
  id?: string;
  name?: string | null;
  avatar_url?: string | null;
  avatar?: string | null;
  thumbnail?: string | null;
}

interface ContactAvatarProps {
  contact: Contact | AvatarContact | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showColoredFallback?: boolean;
  channelType?: string;
  channelProvider?: string;
}

const ContactAvatar: React.FC<ContactAvatarProps> = ({
  contact,
  size = 'md',
  className = '',
  showColoredFallback = false,
  channelType,
  channelProvider,
}) => {
  const { t } = useLanguage('chat');
  const [imageError, setImageError] = useState(false);

  // Reset error state when contact changes
  useEffect(() => {
    setImageError(false);
  }, [contact?.id, contact?.avatar_url, contact?.avatar]);

  // Tamanhos do avatar
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  // Tamanhos dos ícones fallback
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  };

  // Tamanhos do texto das iniciais
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  // Obter dados do contato usando helpers
  const avatarUrl = imageError ? undefined : getContactAvatarUrl(contact);
  const initials = getContactInitials(contact?.name);
  const colorClass = showColoredFallback
    ? getContactAvatarColor(contact?.name)
    : 'bg-primary/10 text-primary';

  // 📞 HELPER: Formatar nome do canal para exibição amigável
  const getChannelDisplayName = (channelType?: string, provider?: string): string => {
    if (!channelType) return t('contactAvatar.unknownChannel');

    // Remover namespace "Channel::" se existir
    const cleanType = channelType.replace('Channel::', '');

    // Mapeamento de tipos de canal
    const channelNames: Record<string, string> = {
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      email: 'E-mail',
      sms: 'SMS',
      api: 'API',
      webwidget: 'Web Widget',
      website: 'Web Widget',
      web_widget: 'Web Widget',
      facebookpage: 'Facebook',
      facebook: 'Facebook',
      instagram: 'Instagram',
      twitter: 'Twitter',
      line: 'Line',
      twiliosms: 'SMS (Twilio)',
    };

    // Mapeamento de provedores
    const providerNames: Record<string, string> = {
      evolution: 'Evolution API',
      evolution_go: 'Evolution Go',
      whatsapp_cloud: 'WhatsApp Cloud',
      notificame: 'Notificame',
      zapi: 'Z-API',
      twilio: 'Twilio',
      default: 'Padrão',
      google: 'Google',
      microsoft: 'Microsoft',
    };

    const channelName = channelNames[cleanType.toLowerCase()] || cleanType;

    // Se tiver provider específico, adicionar ao nome
    if (provider && providerNames[provider.toLowerCase()]) {
      return `${channelName} (${providerNames[provider.toLowerCase()]})`;
    }

    return channelName;
  };

  const channelDisplayName = getChannelDisplayName(channelType, channelProvider);

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} flex-shrink-0 ${className}`}>
        {avatarUrl && (
          <AvatarImage
            src={avatarUrl}
            alt={contact?.name || t('contactAvatar.avatarAlt')}
            onError={() => {
              console.warn(`Failed to load avatar for contact ${contact?.name}:`, avatarUrl);
              setImageError(true);
            }}
            onLoad={() => setImageError(false)}
          />
        )}
        <AvatarFallback className={`${colorClass} ${textSizes[size]}`}>
          {initials || <MessageCircle className={iconSizes[size]} />}
        </AvatarFallback>
      </Avatar>

      {/* Channel icon badge - positioned at bottom right */}
      {channelType && (
        <div className="absolute -bottom-1 -right-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <ChannelIcon
                    channelType={channelType}
                    provider={channelProvider}
                    size="sm"
                    className="w-5 h-5 border-2 border-background hover:scale-110 transition-transform duration-200"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="px-3 py-2 bg-popover border border-border shadow-lg rounded-lg"
              >
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">{channelDisplayName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('contactAvatar.communicationChannel')}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default ContactAvatar;
