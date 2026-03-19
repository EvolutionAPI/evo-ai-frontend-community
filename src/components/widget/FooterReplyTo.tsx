import React from 'react';
import ReplyToChip from './ReplyToChip';
import Composer from './Composer';
import type { MessageItem } from './MessageList';

interface FooterReplyToProps {
  replyToMessage: MessageItem | null;
  onClearReply: () => void;
  onSend: (text: string, replyTo?: string | number | null) => void;
  onUpload?: (file: File) => void;
  isUploading?: boolean;
  onTyping?: (isTyping: boolean) => void;
  widgetColor?: string;
}

const FooterReplyTo: React.FC<FooterReplyToProps> = ({
  replyToMessage,
  onClearReply,
  onSend,
  onUpload,
  isUploading,
  onTyping,
  widgetColor,
}) => {
  const handleSend = (text: string) => {
    onSend(text, replyToMessage?.id || null);
    // Clear reply after sending
    onClearReply();
  };

  return (
    <div className="border-t border-slate-200 bg-white">
      {replyToMessage && replyToMessage.type !== 'system' && (
        <ReplyToChip
          replyToMessage={replyToMessage as MessageItem & { type: 'in' | 'out' }}
          onClose={onClearReply}
        />
      )}
      <Composer
        onSend={handleSend}
        onUpload={onUpload}
        isUploading={isUploading}
        onTyping={onTyping}
        widgetColor={widgetColor}
      />
    </div>
  );
};

export default FooterReplyTo;
