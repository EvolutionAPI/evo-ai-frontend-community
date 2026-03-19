import type { Inbox } from '@/types/channels/inbox';

export const CHANNEL_TYPE_MAP: Record<string, string> = {
  'Channel::Whatsapp': 'whatsapp',
  'Channel::WhatsappCloud': 'whatsapp',
  'Channel::Whatsapp360Dialog': 'whatsapp',
  'Channel::Sms': 'sms',
  'Channel::TwilioSms': 'sms',
  'Channel::Email': 'email',
  'Channel::Telegram': 'telegram',
};

export const SUPPORTED_PAYLOAD_CHANNELS = ['whatsapp', 'sms', 'email', 'telegram'] as const;

type SupportedPayloadChannel = (typeof SUPPORTED_PAYLOAD_CHANNELS)[number];

export interface ChannelOption {
  value: string;
  label: string;
}

export const getChannelDisplayName = (channelType: string, t: (key: string) => string): string => {
  const simpleType = CHANNEL_TYPE_MAP[channelType];
  switch (simpleType) {
    case 'whatsapp':
      return t('scheduledActions.channelWhatsapp');
    case 'sms':
      return t('scheduledActions.channelSms');
    case 'email':
      return t('scheduledActions.channelEmail');
    case 'telegram':
      return t('scheduledActions.channelTelegram');
    default:
      return channelType;
  }
};

export const getMessagingInboxes = (inboxes: Inbox[]): Inbox[] => {
  return inboxes.filter(inbox => Object.prototype.hasOwnProperty.call(CHANNEL_TYPE_MAP, inbox.channel_type));
};

export const buildChannelOptions = (inboxes: Inbox[], t: (key: string) => string): ChannelOption[] => {
  const optionsByChannel = new Map<SupportedPayloadChannel, ChannelOption>();

  inboxes.forEach(inbox => {
    const channelValue = CHANNEL_TYPE_MAP[inbox.channel_type] as SupportedPayloadChannel | undefined;
    if (!channelValue || optionsByChannel.has(channelValue)) {
      return;
    }

    optionsByChannel.set(channelValue, {
      value: channelValue,
      label: `${inbox.name} (${getChannelDisplayName(inbox.channel_type, t)})`,
    });
  });

  return Array.from(optionsByChannel.values());
};

export const isSupportedPayloadChannel = (channel: string): channel is SupportedPayloadChannel => {
  return SUPPORTED_PAYLOAD_CHANNELS.includes(channel as SupportedPayloadChannel);
};
