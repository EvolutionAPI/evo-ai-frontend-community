import React, { useState, useRef } from 'react';
import { Button } from '@evoapi/design-system/button';
import { ChatAttachment } from './ChatAttachment';
import { EmojiPickerComponent } from './EmojiPicker';
import { ResizableTextarea, ResizableTextareaRef } from './ResizableTextarea';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, Send } from 'lucide-react';

interface ComposerProps {
  onSend: (text: string) => void | Promise<void>;
  onUpload?: (file: File) => void;
  isUploading?: boolean;
  onTyping?: (isTyping: boolean) => void;
  widgetColor?: string;
}

const Composer: React.FC<ComposerProps> = ({
  onSend,
  onUpload,
  isUploading = false,
  onTyping,
  widgetColor = '#00d4aa',
}) => {
  const { t } = useLanguage('widget');
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<ResizableTextareaRef>(null);

  const handleSend = async () => {
    const v = text.trim();
    if (!v) return;

    try {
      setIsSending(true);
      await onSend(v);
      setText('');
      // Stop typing indicator when sending
      onTyping?.(false);
      setIsSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Trigger typing indicator
    if (onTyping) {
      if (newText.length > 0 && text.length === 0) {
        // Started typing
        onTyping(true);
      } else if (newText.length === 0 && text.length > 0) {
        // Stopped typing (cleared text)
        onTyping(false);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentText = text;

    const newText = currentText.slice(0, start) + emoji + currentText.slice(end);
    setText(newText);

    // Trigger typing indicator if starting to type
    if (onTyping && currentText.length === 0) {
      onTyping(true);
    }

    // Focus back to textarea and set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className="flex gap-2 p-2 border-t border-slate-200 bg-white">
      {/* Show attachment button only when input is empty (like Vue widget) */}
      {text.length === 0 && (
        <ChatAttachment
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
          isDisabled={false}
        />
      )}
      <div className="flex-1 relative min-w-0">
        <ResizableTextarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={t('composer.placeholder')}
          className="w-full pr-12"
          maxRows={4}
          minRows={1}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        {/* Emoji picker positioned inside the textarea */}
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
          <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
        </div>
      </div>
      {/* Show send button only when there's text (like Vue widget) */}
      {text.length > 0 && (
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isSending}
          className="h-9 w-9 flex-shrink-0 disabled:bg-muted disabled:text-muted-foreground hover:opacity-80"
          style={{
            backgroundColor: widgetColor,
            color: 'white',
            borderColor: widgetColor,
          }}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default Composer;
