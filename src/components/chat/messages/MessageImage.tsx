import React, { useState } from 'react';
import { Button } from '@evoapi/design-system/button';
import { Download, ZoomIn, ZoomOut, X } from 'lucide-react';
import { toast } from 'sonner';
import { Attachment } from '@/types/chat/api';
import { useLanguage } from '@/hooks/useLanguage';
import { openAttachmentInNewTab } from '@/components/chat/messages/utils/openAttachmentInNewTab';

interface MessageImageProps {
  attachments: Attachment[];
}

const MessageImage: React.FC<MessageImageProps> = ({ attachments }) => {
  const { t } = useLanguage('chat');
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [imageZoom, setImageZoom] = useState(1);

  const resolveImageSrc = (attachment: Attachment): string | null => {
    const src = attachment.thumb_url || attachment.data_url;
    return src && src.trim() !== '' ? src : null;
  };

  const resolveNextImageSrc = (currentSrc: string, attachment: Attachment): string | null => {
    const orderedSources = [attachment.thumb_url, attachment.data_url]
      .filter((source): source is string => !!source && source.trim() !== '');
    const currentIndex = orderedSources.findIndex(source => currentSrc.includes(source));
    const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 1;
    return orderedSources[nextIndex] || null;
  };

  const downloadFile = (attachment: Attachment) => {
    const result = openAttachmentInNewTab({
      url: attachment.data_url,
      filename: attachment.fallback_title || t('messages.messageImage.imageFallback'),
    });

    if (result === 'download-fallback') {
      toast.success(t('messages.messageImage.downloadStarted'), {
        description: attachment.fallback_title || t('messages.messageImage.imageFallback'),
      });
    }
  };

  const openImageModal = (attachment: Attachment) => {
    if (resolveImageSrc(attachment)) {
      setSelectedImage(attachment);
      setImageZoom(1);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  return (
    <>
      <div className="space-y-2">
        {attachments.map((attachment, index) => {
            const imageSrc = resolveImageSrc(attachment);
            return (
          <div key={attachment.id || index} className="space-y-1">
            {/* Container da imagem com hover isolado */}
            <div className="relative group">
              {/* ✅ CONTAINER RESPONSIVO COM TAMANHO FIXO - evita mudança de layout */}
              <div
                className="relative bg-muted/20 rounded-lg overflow-hidden w-full"
                style={{
                  minWidth: '200px', // ✅ Largura mínima menor para mobile
                  maxWidth: 'min(280px, calc(100vw - 120px))', // ✅ Responsivo baseado na viewport
                  height: '180px', // ✅ Altura menor para mobile
                  aspectRatio: '16/9', // ✅ Proporção consistente
                }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={attachment.fallback_title || t('messages.messageImage.imageFallback')}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm rounded-lg"
                    onClick={() => openImageModal(attachment)}
                    loading="lazy"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const nextSrc = resolveNextImageSrc(img.src, attachment);
                      if (nextSrc) {
                        img.src = nextSrc;
                        return;
                      }
                      img.style.display = 'none';
                    }}
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground px-3 text-center">
                    {attachment.fallback_title || t('messages.messageImage.imageFallback')}
                  </div>
                )}
              </div>

              {/* ✅ OVERLAY com botões - posicionado sobre o container fixo */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={e => {
                      e.stopPropagation();
                      openImageModal(attachment);
                    }}
                    className="bg-white/95 text-black hover:bg-white shadow-lg"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={e => {
                      e.stopPropagation();
                      downloadFile(attachment);
                    }}
                    className="bg-white/95 text-black hover:bg-white shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Info da imagem - fora do grupo hover */}
            <div className="space-y-1">
              {attachment.fallback_title && (
                <div className="text-xs text-muted-foreground truncate">
                  {attachment.fallback_title}
                </div>
              )}
              {attachment.file_size && (
                <div className="text-xs text-muted-foreground/70">
                  {formatFileSize(attachment.file_size)}
                </div>
              )}
            </div>
          </div>
            );
          })}
      </div>

      {/* Modal melhorado para zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={() => setSelectedImage(null)}
        >
          {/* Header com controles */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
            <div className="text-white">
              <h3 className="font-medium">{selectedImage.fallback_title || t('messages.messageImage.imageFallback')}</h3>
              <div className="flex items-center gap-4 text-sm text-white/70">
                {selectedImage.file_size && <span>{formatFileSize(selectedImage.file_size)}</span>}
                {selectedImage.extension && (
                  <span className="uppercase">{selectedImage.extension}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Controles de zoom */}
              <Button
                size="sm"
                variant="secondary"
                onClick={e => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={imageZoom <= 0.25}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="text-white text-sm min-w-16 text-center">
                {Math.round(imageZoom * 100)}%
              </span>

              <Button
                size="sm"
                variant="secondary"
                onClick={e => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={imageZoom >= 3}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Botão de download */}
              <Button
                size="sm"
                variant="secondary"
                onClick={e => {
                  e.stopPropagation();
                  downloadFile(selectedImage);
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Botão de fechar */}
              <Button
                size="sm"
                variant="secondary"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Container da imagem */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {resolveImageSrc(selectedImage) && (
              <img
                src={resolveImageSrc(selectedImage) || undefined}
                alt={selectedImage.fallback_title || t('messages.messageImage.imageZoomedAlt')}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center',
                }}
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageImage;
