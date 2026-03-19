import { WidgetConfig } from '../helpers/widgetHelpers';
import { useLanguage } from '@/hooks/useLanguage';

interface WidgetBodyProps {
  config: WidgetConfig & {
    isOnline?: boolean;
    isDefaultScreen?: boolean;
  };
}

export default function WidgetBody({ config }: WidgetBodyProps) {
  const { t } = useLanguage('channels');
  return (
    <div className="h-40 px-4 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
      <div className="py-4 space-y-4">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-[85%]">
            <div
              className="rounded-2xl rounded-br-sm text-white text-sm px-4 py-3 inline-block"
              style={{ backgroundColor: config.widgetColor }}
            >
              <p className="m-0">
                {t('settings.widget.body.userMessage')}
              </p>
            </div>
          </div>
        </div>

        {/* Agent Message */}
        <div className="flex justify-start">
          <div className="max-w-[85%]">
            <div className="bg-white dark:bg-slate-700 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 inline-block text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600">
              <p className="m-0">
                {t('settings.widget.body.agentMessage')}
              </p>
            </div>
          </div>
        </div>

        {/* Typing Indicator (when in chat screen) */}
        {!config.isDefaultScreen && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 inline-block border border-slate-200 dark:border-slate-600">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
