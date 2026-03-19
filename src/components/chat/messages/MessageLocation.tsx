import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Attachment } from '@/types/chat/api';
import { useLanguage } from '@/hooks/useLanguage';

interface MessageLocationProps {
  attachments: Attachment[];
}

const MessageLocation: React.FC<MessageLocationProps> = ({ attachments }) => {
  const { t } = useLanguage('chat');
  
  const openInMaps = (attachment: Attachment) => {
    const { coordinates_lat, coordinates_long, external_url } = attachment;

    // Usar external_url se disponível, senão gerar link do Google Maps
    const mapsUrl =
      external_url || `https://www.google.com/maps?q=${coordinates_lat},${coordinates_long}`;

    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const formatCoordinates = (lat: number, lng: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
  };

  return (
    <div className="space-y-2">
      {attachments
        .filter(attachment => {
          // 🔒 FILTRAR: Apenas attachments com coordenadas válidas OU external_url
          return attachment && (
            (attachment.coordinates_lat && attachment.coordinates_long) ||
            attachment.external_url
          );
        })
        .map((attachment, index) => (
        <div
          key={attachment.id || index}
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
            minWidth: '240px',
            maxWidth: 'min(300px, calc(100vw - 120px))',
          }}
        >
          {/* Content - Header com ícone e título */}
          <div className="flex items-start gap-2.5 p-2.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground leading-tight mb-0.5">
                {attachment.fallback_title || t('messages.messageLocation.sharedLocation')}
              </div>
              <div className="text-xs text-muted-foreground font-mono leading-tight">
                {formatCoordinates(attachment.coordinates_lat, attachment.coordinates_long)}
              </div>
            </div>
          </div>

          {/* Separator - mesma cor das coordenadas */}
          <div className="border-t border-muted-foreground/20" />

          {/* Footer - Botão para abrir no Google Maps */}
          <button
            onClick={() => openInMaps(attachment)}
            className="w-full px-3 py-2 flex items-center justify-center cursor-pointer"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{t('messages.messageLocation.openInMaps')}</span>
            </span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default MessageLocation;
