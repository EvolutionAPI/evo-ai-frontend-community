import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({
  onEmojiSelect,
  className = '',
}) => {
  const { t } = useLanguage('widget');
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={togglePicker}
        className={`p-2 rounded-full transition-colors duration-200 hover:bg-slate-100 ${
          isOpen ? 'bg-slate-100' : ''
        }`}
        title={t('emoji.addEmoji')}
        type="button"
      >
        <Smile
          size={20}
          className={`transition-colors duration-200 ${
            isOpen ? 'text-amber-500' : 'text-slate-500 hover:text-slate-700'
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full mb-2 right-0 z-50 shadow-lg rounded-lg overflow-hidden"
          style={{ transform: 'translateX(0)' }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            searchDisabled={false}
            skinTonesDisabled={true}
            width={300}
            height={400}
            previewConfig={{
              showPreview: false,
            }}
          />
        </div>
      )}
    </div>
  );
};
