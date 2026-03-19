import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@evoapi/design-system/button';

interface BannerProps {
  /**
   * Main banner message text
   */
  bannerMessage: string;

  /**
   * Optional external link
   */
  hrefLink?: string;

  /**
   * Link text to display
   */
  hrefLinkText?: string;

  /**
   * Optional action button
   */
  hasActionButton?: boolean;

  /**
   * Action button label
   */
  actionButtonLabel?: string;

  /**
   * Action button click handler
   */
  onPrimaryAction?: () => void;

  /**
   * Color scheme of the banner
   * @default 'alert'
   */
  colorScheme?: 'primary' | 'secondary' | 'alert' | 'warning';
}

const Banner: React.FC<BannerProps> = ({
  bannerMessage,
  hrefLink,
  hrefLinkText,
  hasActionButton = false,
  actionButtonLabel,
  onPrimaryAction,
  colorScheme = 'alert',
}) => {
  // Color scheme classes mapping
  const colorSchemeClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    alert: 'bg-destructive/90 text-destructive-foreground',
    warning: 'bg-yellow-500 text-white dark:bg-yellow-600',
  };

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 text-xs rounded-lg mx-2 mt-2 ${colorSchemeClasses[colorScheme]}`}
    >
      <div className="flex items-center gap-2 flex-1">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="banner-message">
          {bannerMessage}
          {hrefLink && hrefLinkText && (
            <>
              {' '}
              <a
                href={hrefLink}
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="underline hover:opacity-80 transition-opacity"
              >
                {hrefLinkText}
              </a>
            </>
          )}
        </span>
      </div>

      {hasActionButton && actionButtonLabel && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onPrimaryAction}
          className="flex-shrink-0 h-8 text-xs"
        >
          {actionButtonLabel}
        </Button>
      )}
    </div>
  );
};

export default Banner;
