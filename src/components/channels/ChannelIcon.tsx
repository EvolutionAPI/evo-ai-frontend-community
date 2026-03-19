import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';

interface ChannelIconProps {
  channelType?: string;
  provider?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

function getChannelIconSrc(channelType?: string, provider?: string): string | undefined {
  if (!channelType) return undefined;

  const keyRaw = channelType.replace('Channel::', '').toLowerCase();
  const key = keyRaw.replace(/\s|_/g, '');
  const prov = (provider || '').toLowerCase();

  try {
    // WhatsApp by provider
    if (key.includes('whatsapp')) {
      if (prov === 'whatsapp_cloud') {
        return new URL('@/assets/channels/whatsapp-cloud.svg', import.meta.url).toString();
      }
      if (prov === 'evolution') {
        return new URL('@/assets/channels/evolution-api.png', import.meta.url).toString();
      }
      if (prov === 'evolution_go') {
        return new URL('@/assets/channels/evolution-go.png', import.meta.url).toString();
      }
      if (prov === 'notificame') {
        return new URL('@/assets/channels/notificame.png', import.meta.url).toString();
      }
      if (prov === 'zapi') {
        return new URL('@/assets/channels/zapi.png', import.meta.url).toString();
      }
      if (prov === 'default' || prov === 'twilio') {
        return new URL('@/assets/channels/twilio.png', import.meta.url).toString();
      }
      return new URL('@/assets/channels/whatsapp.png', import.meta.url).toString();
    }

    // SMS by provider and type
    if (key.includes('twiliosms')) {
      return new URL('@/assets/channels/twilio.png', import.meta.url).toString();
    }
    if (key === 'sms' || key.includes('sms')) {
      if (prov === 'twilio') {
        return new URL('@/assets/channels/twilio.png', import.meta.url).toString();
      }
      // Bandwidth or others fallback to generic SMS
      return new URL('@/assets/channels/sms.png', import.meta.url).toString();
    }

    // Email by provider
    if (key.includes('email')) {
      if (prov === 'google') {
        return new URL('@/assets/channels/google.png', import.meta.url).toString();
      }
      if (prov === 'microsoft') {
        return new URL('@/assets/channels/microsoft.png', import.meta.url).toString();
      }
      return new URL('@/assets/channels/email.png', import.meta.url).toString();
    }

    // Web Widget
    if (key.includes('webwidget') || key.includes('website') || key === 'web_widget') {
      return new URL('@/assets/channels/website.png', import.meta.url).toString();
    }

    // API
    if (key === 'api' || key.includes('api')) {
      return new URL('@/assets/channels/api.png', import.meta.url).toString();
    }

    // Facebook / Messenger
    if (key.includes('facebook') || key === 'facebookpage') {
      return new URL('@/assets/channels/facebook.png', import.meta.url).toString();
    }

    // Instagram
    if (key.includes('instagram')) {
      return new URL('@/assets/channels/instagram.png', import.meta.url).toString();
    }

    // Telegram
    if (key.includes('telegram')) {
      return new URL('@/assets/channels/telegram.png', import.meta.url).toString();
    }

    // Twitter
    if (key.includes('twitter')) {
      return new URL('@/assets/channels/twitter.png', import.meta.url).toString();
    }

    // Line
    if (key.includes('line')) {
      return new URL('@/assets/channels/line.png', import.meta.url).toString();
    }

    return undefined;
  } catch {
    return undefined;
  }
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const containerSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-18 h-18'
};

export default function ChannelIcon({
  channelType,
  provider,
  size = 'md',
  className,
  fallbackIcon
}: ChannelIconProps) {
  const { t } = useLanguage('channels');
  const iconSrc = getChannelIconSrc(channelType, provider);

  if (!iconSrc && !fallbackIcon) {
    return (
      <div
        className={cn(
          'rounded-lg bg-slate-900 flex items-center justify-center text-sidebar-foreground/60',
          containerSizeClasses[size],
          className
        )}
      >
        <span className="text-xs font-medium">
          {channelType ? channelType.charAt(0).toUpperCase() : '?'}
        </span>
      </div>
    );
  }

  if (!iconSrc && fallbackIcon) {
    return (
      <div
        className={cn(
          'rounded-lg bg-slate-900 flex items-center justify-center',
          containerSizeClasses[size],
          className
        )}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden',
        containerSizeClasses[size],
        className
      )}
    >
      <img
        src={iconSrc}
        alt={channelType || t('common.channel')}
        className={cn('object-contain', sizeClasses[size])}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}
