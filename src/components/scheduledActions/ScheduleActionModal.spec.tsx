import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Inbox } from '@/types/channels/inbox';
import InboxesService from '@/services/channels/inboxesService';
import { ScheduleActionModal } from './ScheduleActionModal';

vi.mock('lucide-react', () => ({
  Search: () => null,
  Loader2: () => null,
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/services/channels/inboxesService', () => ({
  default: {
    list: vi.fn(),
  },
}));

vi.mock('@/services/contacts', () => ({
  contactsService: {
    getContact: vi.fn().mockResolvedValue(null),
    searchContacts: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('@/services/scheduledActions/scheduledActionsService', () => ({
  scheduledActionsService: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@evoapi/design-system', () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

  const extractOptionNodes = (children: React.ReactNode): React.ReactNode[] => {
    return React.Children.toArray(children).flatMap(child => {
      if (!React.isValidElement(child)) {
        return [];
      }

      if (child.type === SelectItem) {
        return [child];
      }

      return extractOptionNodes(child.props.children);
    });
  };

  const Select = ({
    value,
    onValueChange,
    children,
    disabled,
  }: {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <select
      aria-label="mock-select"
      value={value || ''}
      onChange={event => onValueChange?.(event.target.value)}
      disabled={disabled}
    >
      <option value="">placeholder</option>
      {extractOptionNodes(children)}
    </select>
  );

  const SelectItem = ({
    value,
    children,
  }: {
    value: string;
    children?: React.ReactNode;
  }) => <option value={value}>{children}</option>;

  return {
    Dialog: passthrough,
    DialogContent: passthrough,
    DialogHeader: passthrough,
    DialogTitle: passthrough,
    DialogFooter: passthrough,
    Button: ({ children }: { children?: React.ReactNode }) => <button type="button">{children}</button>,
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    Label: ({
      htmlFor,
      children,
    }: {
      htmlFor?: string;
      children?: React.ReactNode;
    }) => <label htmlFor={htmlFor}>{children}</label>,
    Select,
    SelectContent: passthrough,
    SelectItem,
    SelectTrigger: passthrough,
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
    Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
  };
});

const mockedInboxesService = vi.mocked(InboxesService);

const buildInbox = (overrides: Partial<Inbox>): Inbox => ({
  id: overrides.id || 'inbox-id',
  name: overrides.name || 'Inbox',
  account_id: 'acc-1',
  channel_id: 'channel-1',
  channel_type: overrides.channel_type || 'Channel::Telegram',
  ...overrides,
});

describe('ScheduleActionModal', () => {
  it('shows unique channel options for mixed inbox types', async () => {
    mockedInboxesService.list.mockResolvedValue({
      success: true,
      data: [
        buildInbox({ id: 'wa-cloud', name: 'WhatsApp Cloud', channel_type: 'Channel::WhatsappCloud' }),
        buildInbox({ id: 'wa-legacy', name: 'WhatsApp Legacy', channel_type: 'Channel::Whatsapp' }),
        buildInbox({ id: 'sms-twilio', name: 'Twilio SMS', channel_type: 'Channel::TwilioSms' }),
        buildInbox({ id: 'sms-legacy', name: 'SMS', channel_type: 'Channel::Sms' }),
        buildInbox({ id: 'email-team', name: 'Email Team', channel_type: 'Channel::Email' }),
        buildInbox({ id: 'telegram-team', name: 'Telegram Team', channel_type: 'Channel::Telegram' }),
        buildInbox({ id: 'api-team', name: 'API Team', channel_type: 'Channel::Api' }),
      ],
      meta: {} as never,
      message: '',
    });

    render(
      <ScheduleActionModal
        open
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mockedInboxesService.list).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'WhatsApp Cloud (scheduledActions.channelWhatsapp)' })).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Twilio SMS (scheduledActions.channelSms)' })).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Email Team (scheduledActions.channelEmail)' })).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Telegram Team (scheduledActions.channelTelegram)' })).toBeTruthy();
    });

    expect(screen.queryByRole('option', { name: 'WhatsApp Legacy (scheduledActions.channelWhatsapp)' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'SMS (scheduledActions.channelSms)' })).toBeNull();
    expect(screen.queryByRole('option', { name: /API Team/ })).toBeNull();
  });
});
