import { useState } from 'react';
import { Avatar, AvatarFallback, Input } from '@evoapi/design-system';
import { ArrowRight, Smile, Send } from 'lucide-react';
import { WidgetConfig } from '../helpers/widgetHelpers';
import { getReplyTimeDisplayText } from '../helpers/widgetHelpers';
import { useLanguage } from '@/hooks/useLanguage';

interface WidgetFooterProps {
  config: WidgetConfig & {
    isOnline?: boolean;
    isDefaultScreen?: boolean;
  };
}

export default function WidgetFooter({ config }: WidgetFooterProps) {
  const { t } = useLanguage('channels');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const getStatusText = () => {
    return config.isOnline ? t('settings.widget.footer.teamOnline') : t('settings.widget.footer.teamOffline');
  };

  return (
    <div className="relative flex flex-col w-full px-4 pb-4">
      {config.isDefaultScreen ? (
        // Default Screen Footer
        <div className="p-4 bg-white dark:bg-slate-700 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-50">
                {getStatusText()}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {getReplyTimeDisplayText(config.replyTime)}
              </div>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback
                className="text-white text-sm font-medium"
                style={{ backgroundColor: config.widgetColor }}
              >
                C
              </AvatarFallback>
            </Avatar>
          </div>

          <button
            className="inline-flex items-center justify-between px-2 py-1 mt-3 -ml-2 font-medium bg-transparent rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            style={{ color: config.widgetColor }}
          >
            <span className="pr-2 text-xs">
              {t('settings.widget.footer.startConversation')}
            </span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        // Chat Screen Footer
        <div
          className={`
            flex items-center h-10 bg-white dark:bg-slate-700 rounded-md border transition-all
            ${isInputFocused
              ? 'ring-2 border-transparent'
              : 'border-slate-200 dark:border-slate-600'
            }
          `}
          style={{
            '--tw-ring-color': isInputFocused ? config.widgetColor : 'transparent',
          } as React.CSSProperties}
        >
          <Input
            id="chat-input"
            placeholder={t('settings.widget.footer.messagePlaceholder')}
            className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 text-sm h-8 px-3"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />

          <div className="flex items-center gap-2 px-2">
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
              <Smile className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            <button
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
              style={{ color: config.widgetColor }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
