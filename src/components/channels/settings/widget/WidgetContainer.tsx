import { useState } from 'react';
import WidgetHead from './WidgetHead';
import WidgetBody from './WidgetBody';
import WidgetFooter from './WidgetFooter';
import { WidgetConfig } from '../helpers/widgetHelpers';
import { useLanguage } from '@/hooks/useLanguage';

interface WidgetContainerProps {
  config: WidgetConfig & {
    isOnline?: boolean;
    isDefaultScreen?: boolean;
  };
}

export default function WidgetContainer({ config }: WidgetContainerProps) {
  const { t } = useLanguage('channels');
  const [isWidgetVisible, setIsWidgetVisible] = useState(true);

  const toggleWidget = () => {
    setIsWidgetVisible(!isWidgetVisible);
  };

  const getBubblePositionStyle = () => {
    return config.widgetBubblePosition === 'left' ? 'justify-start' : 'justify-end';
  };

  const isBubbleExpanded = !isWidgetVisible && config.widgetBubbleType === 'expanded_bubble';

  const getWidgetBubbleLauncherTitle = () => {
    return isWidgetVisible || config.widgetBubbleType === 'standard'
      ? ' '
      : config.widgetBubbleLauncherTitle;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Widget Container */}
      {isWidgetVisible && (
        <div className="widget-wrapper flex flex-col justify-between rounded-lg shadow-lg bg-white dark:bg-slate-800 h-[500px] w-80 border border-slate-200 dark:border-slate-700">
          <WidgetHead config={config} />
          <div>
            {!config.isDefaultScreen && (
              <WidgetBody config={config} />
            )}
            <WidgetFooter config={config} />

            {/* Evolution Branding */}
            <div className="py-2.5 flex justify-center border-t border-slate-100 dark:border-slate-700">
              <a className="items-center gap-1 text-slate-500 dark:text-slate-400 cursor-pointer flex filter grayscale opacity-90 hover:grayscale-0 hover:opacity-100 text-xs">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{t('settings.widget.container.poweredBy')}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Widget Bubble */}
      <div className={`flex mt-4 w-80 ${getBubblePositionStyle()}`}>
        <button
          className={`
            relative flex items-center justify-center rounded-full cursor-pointer transition-all shadow-lg hover:shadow-xl
            ${isBubbleExpanded
              ? 'w-auto font-medium text-base text-white dark:text-white h-12 px-4'
              : 'w-16 h-16'
            }
          `}
          style={{ backgroundColor: config.widgetColor }}
          onClick={toggleWidget}
        >
          {/* Chat Icon when widget is closed */}
          {!isWidgetVisible && (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}

          {/* Expanded title */}
          {isBubbleExpanded && (
            <div className="pl-2.5">
              {getWidgetBubbleLauncherTitle()}
            </div>
          )}

          {/* Close X when widget is open */}
          {isWidgetVisible && (
            <div className="relative w-6 h-6">
              <div className="absolute top-1/2 left-1/2 w-0.5 h-6 rotate-45 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
              <div className="absolute top-1/2 left-1/2 w-0.5 h-6 -rotate-45 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
