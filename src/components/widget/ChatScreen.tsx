import MessageList, { MessageItem } from '@/components/widget/MessageList';
import FooterReplyTo from '@/components/widget/FooterReplyTo';
import TypingIndicator from '@/components/widget/TypingIndicator';
import EmailTranscriptButton from '@/components/widget/EmailTranscriptButton';
import StartNewConversationButton from '@/components/widget/StartNewConversationButton';
import Toast from '@/components/widget/Toast';
import type { AttachmentUpload } from '@/types/core/attachments';

type ToastType = 'success' | 'error' | 'info';

type UiState = {
  title?: string;
  subtitle?: string;
  color?: string;
  avatarUrl?: string;
};

type EnhancedConfig = {
  showEmailTranscriptButton: boolean;
  hideReplyBox: boolean;
};

type WidgetChatScreenProps = {
  t: (key: string) => string;
  ui: UiState;
  messages: MessageItem[];
  pendingUploads: AttachmentUpload[];
  isAgentTyping: boolean;
  isLoadingOlderMessages: boolean;
  hasMoreMessages: boolean;

  enhancedConfig: EnhancedConfig;

  replyToMessage: MessageItem | null;
  toastMessage: string | null;
  toastType: ToastType;

  onSend: (text: string, replyTo?: string | number | null) => void;
  onReplyToMessage: (message: MessageItem) => void;
  onClearReply: () => void;
  onFileUpload: (file: File) => void;
  onTyping: (isTyping: boolean) => void;
  onLoadMore: () => void;
  onStartNewConversation: () => void;

  onToastClose: () => void;
  onToast: (message: string, type?: ToastType) => void;

  websiteToken: string;
};

export function WidgetChatScreen({
  t,
  ui,
  messages,
  pendingUploads,
  isAgentTyping,
  isLoadingOlderMessages,
  hasMoreMessages,
  enhancedConfig,
  replyToMessage,
  toastMessage,
  toastType,
  onSend,
  onReplyToMessage,
  onClearReply,
  onFileUpload,
  onTyping,
  onLoadMore,
  onStartNewConversation,
  onToastClose,
  onToast,
  websiteToken,
}: WidgetChatScreenProps) {
  const widgetColor = ui.color || '#00d4aa';

  return (
    <>
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <MessageList
          items={messages}
          inboundAvatarUrl={ui.avatarUrl}
          onRetry={(_id, text) => onSend(text)}
          onReply={onReplyToMessage}
          widgetColor={widgetColor}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingOlderMessages}
          hasMore={hasMoreMessages}
        />

        {/* Typing indicator */}
        <TypingIndicator
          isVisible={isAgentTyping}
          avatarUrl={ui.avatarUrl}
          agentName={t('chat.agent')}
        />
      </div>

      {/* Fixed Footer Area */}
      <div className="flex-shrink-0 bg-white">
        {/* Show pending uploads */}
        {pendingUploads.length > 0 && (
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="text-sm text-gray-600 mb-2">{t('chat.uploadingFiles')}</div>
            {pendingUploads.map(upload => (
              <div key={upload.id} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 flex-1 truncate">
                  {upload.file.name}
                </span>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ))}
          </div>
        )}

        {/* Email Transcript Button - show only if user has email */}
        {enhancedConfig.showEmailTranscriptButton && messages.length > 0 && (
          <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-end">
              <EmailTranscriptButton
                websiteToken={websiteToken}
                onSuccess={() => onToast(t('toast.emailTranscriptSuccess'), 'success')}
                onError={error => onToast(error, 'error')}
                widgetColor={widgetColor}
              />
            </div>
          </div>
        )}

        {/* Conditional Footer - either input or start new conversation button */}
        {enhancedConfig.hideReplyBox ? (
          <StartNewConversationButton
            onStartNew={onStartNewConversation}
            widgetColor={widgetColor}
          />
        ) : (
          <FooterReplyTo
            replyToMessage={replyToMessage}
            onClearReply={onClearReply}
            onSend={onSend}
            onUpload={onFileUpload}
            isUploading={pendingUploads.length > 0}
            onTyping={onTyping}
            widgetColor={widgetColor}
          />
        )}
      </div>

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={onToastClose} />
      )}
    </>
  );
}
