import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ReplyToChipProps {
  replyToMessage: {
    id: string | number;
    text: string;
    sender?: {
      name?: string;
    };
    type: 'in' | 'out';
  };
  onClose: () => void;
}

const ReplyToChip: React.FC<ReplyToChipProps> = ({
  replyToMessage,
  onClose,
}) => {
  const { t } = useLanguage('widget');
  const senderName =
    replyToMessage.type === 'out' ? t('replyTo.you') : replyToMessage.sender?.name || t('replyTo.agent');

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 border-l-4 border-gray-300 mx-2 mb-2 rounded-r">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-600 mb-1">{t('replyTo.replyingTo', { name: senderName })}</div>
        <div className="text-sm text-gray-800 truncate">{truncateText(replyToMessage.text)}</div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
        title={t('replyTo.cancelReply')}
      >
        <X size={14} className="text-gray-500" />
      </button>
    </div>
  );
};

export default ReplyToChip;
