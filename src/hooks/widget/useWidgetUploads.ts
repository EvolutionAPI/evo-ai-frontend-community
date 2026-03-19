// src/hooks/widget/useWidgetUploads.ts
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { widgetService } from '@/services/widget/widgetService';
import type { AttachmentUpload } from '@/types/core/attachments';
import type { MessageItem } from '@/components/widget/MessageList';

type Params = {
  setMessages: Dispatch<SetStateAction<MessageItem[]>>;
  getConversationId: () => number | undefined;
};

export function useWidgetUploads({ setMessages, getConversationId }: Params) {
  const [pendingUploads, setPendingUploads] = useState<AttachmentUpload[]>([]);

  const updateUploadProgress = (
    uploadId: string,
    progress: number,
    status: 'uploading' | 'completed' | 'failed',
    error?: string,
  ) => {
    setPendingUploads(prev =>
      prev.map(upload =>
        upload.id === uploadId
          ? {
              ...upload,
              progress: {
                ...upload.progress,
                progress,
                status,
                error,
              },
            }
          : upload,
      ),
    );
  };

  const handleSendAttachments = async (uploads: AttachmentUpload[], message?: string) => {
    const echoId = uuidv4();

    const conversationId = getConversationId();

    const optimistic: MessageItem = {
      id: echoId,
      type: 'out',
      text: message || '',
      ts: Date.now(),
      status: 'sending',
      echoId,
      attachments: uploads.map(upload => ({
        id: upload.id,
        file_url: upload.preview || '',
        data_url: upload.preview,
        file_type: upload.file.type,
        file_size: upload.file.size,
        fallback_title: upload.file.name,
      })),
    };

    setMessages(prev => [...prev, optimistic]);
    setPendingUploads(prev => [...prev, ...uploads]);

    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('website_token') || '';
      if (!token) return;

      const files = uploads.map(upload => upload.file);

      uploads.forEach(upload => {
        updateUploadProgress(upload.id, 50, 'uploading');
      });

      await widgetService.sendMultipleAttachments(token, files, message, undefined, echoId, conversationId);

      uploads.forEach(upload => {
        updateUploadProgress(upload.id, 100, 'completed');
      });

      window.setTimeout(() => {
        setPendingUploads([]);
      }, 1000);
    } catch (error) {
      console.error('❌ Widget: Failed to send attachments:', error);

      uploads.forEach(upload => {
        updateUploadProgress(upload.id, 0, 'failed', 'Upload failed');
      });

      setMessages(prev =>
        prev.map(m => (m.id === optimistic.id ? { ...m, status: 'failed' } : m)),
      );
    }
  };

  const handleFileUpload = (file: File) => {
    const fakeUpload: AttachmentUpload = {
      id: uuidv4(),
      file,
      progress: {
        id: uuidv4(),
        progress: 0,
        status: 'uploading',
      },
    };

    handleSendAttachments([fakeUpload]);
  };

  return {
    pendingUploads,
    handleSendAttachments,
    handleFileUpload,
    updateUploadProgress,
  };
}
