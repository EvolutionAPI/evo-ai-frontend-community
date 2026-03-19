import React, { useState } from 'react';
import { Button } from '@evoapi/design-system/button';
import { X, Send, File, FileText, Image, Music, Video, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  onSend: (files: File[]) => void;
  isSending?: boolean;
  uploadProgress?: Record<string, number>;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemove,
  onSend,
  isSending = false,
  uploadProgress = {},
}) => {
  const { t } = useLanguage('chat');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<Record<number, string>>({});

  // const formatFileSize = (bytes: number): string => {
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   if (bytes === 0) return '0 Bytes';
  //   const i = Math.floor(Math.log(bytes) / Math.log(1024));
  //   return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  // };

  const getFileIcon = (file: File) => {
    const type = file.type;

    if (type.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    }
    if (type.startsWith('audio/')) {
      return <Music className="h-6 w-6 text-green-500" />;
    }
    if (type.startsWith('video/')) {
      return <Video className="h-6 w-6 text-purple-500" />;
    }
    if (type === 'application/pdf' || type.includes('document')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }

    return <File className="h-6 w-6 text-muted-foreground" />;
  };

  const getThumbnail = (file: File, index: number) => {
    if (!file.type.startsWith('image/')) return null;

    // Criar URL de preview se não existir
    if (!imagePreviewUrl[index]) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(prev => ({ ...prev, [index]: url }));
      return url;
    }

    return imagePreviewUrl[index];
  };

  // const getFileExtension = (fileName: string): string => {
  //   return fileName.split('.').pop()?.toLowerCase() || '';
  // };

  if (files.length === 0) return null;

  return (
    <div className="border-t bg-muted/30 p-3">
      {/* Files Preview - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {files.map((file, index) => {
          const thumbnail = getThumbnail(file, index);
          const progress = uploadProgress[file.name] || 0;
          const isUploading = isSending && progress > 0;

          return (
            <div key={index} className="relative flex-shrink-0 group">
              {/* File Preview */}
              <div className="w-16 h-16 rounded-lg border bg-background overflow-hidden flex items-center justify-center">
                {thumbnail ? (
                  <img src={thumbnail} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(file)
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(index)}
                disabled={isSending}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Progress Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-xs font-medium">{progress}%</div>
                </div>
              )}

              {/* File Name */}
              <div className="mt-1 text-xs text-center truncate w-16" title={file.name}>
                {file.name.split('.')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Send Action */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          {files.length} {files.length !== 1 ? t('messageInput.filePreview.files') : t('messageInput.filePreview.file')}
        </span>

        {isSending ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('messageInput.filePreview.sending')}
          </div>
        ) : (
          <Button size="sm" onClick={() => onSend(files)} className="gap-1 h-7 text-xs">
            <Send className="h-3 w-3" />
            {t('messageInput.filePreview.send')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
