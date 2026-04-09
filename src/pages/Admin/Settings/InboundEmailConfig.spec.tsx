import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { toast } from 'sonner';
import InboundEmailConfig from './InboundEmailConfig';

const stableT = (key: string) => key;

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: stableT,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockGetConfig = vi.fn();
const mockSaveConfig = vi.fn();

vi.mock('@/services/admin/adminConfigService', () => ({
  adminConfigService: {
    getConfig: (...args: unknown[]) => mockGetConfig(...args),
    saveConfig: (...args: unknown[]) => mockSaveConfig(...args),
  },
}));

vi.mock('@/utils/apiHelpers', () => ({
  extractError: () => ({ message: 'Test error' }),
}));

async function renderAndWait(mockData: Record<string, unknown> = {
  RAILS_INBOUND_EMAIL_SERVICE: 'relay',
  RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
  MAILER_INBOUND_EMAIL_DOMAIN: '',
}) {
  mockGetConfig.mockImplementation(() => Promise.resolve(mockData));
  await act(async () => {
    render(<InboundEmailConfig />);
  });
}

describe('InboundEmailConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<InboundEmailConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads and displays relay config by default', async () => {
    await renderAndWait();

    expect(screen.getByText('inboundEmail.title')).toBeInTheDocument();
    expect(screen.getByText('inboundEmail.description')).toBeInTheDocument();
    expect(mockGetConfig).toHaveBeenCalledWith('inbound_email');
  });

  it('shows password field when relay is selected', async () => {
    await renderAndWait();

    expect(screen.getByLabelText('inboundEmail.fields.password')).toBeInTheDocument();
    expect(screen.getByLabelText('inboundEmail.fields.domain')).toBeInTheDocument();
  });

  it('shows mailgun signing key when mailgun is selected', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'mailgun',
      MAILGUN_SIGNING_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    expect(screen.getByLabelText('inboundEmail.fields.mailgunSigningKey')).toBeInTheDocument();
    expect(screen.queryByLabelText('inboundEmail.fields.password')).not.toBeInTheDocument();
  });

  it('shows mandrill API key when mandrill is selected', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'mandrill',
      MANDRILL_API_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    expect(screen.getByLabelText('inboundEmail.fields.mandrillApiKey')).toBeInTheDocument();
    expect(screen.queryByLabelText('inboundEmail.fields.password')).not.toBeInTheDocument();
  });

  it('shows password field when sendgrid is selected', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'sendgrid',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    expect(screen.getByLabelText('inboundEmail.fields.password')).toBeInTheDocument();
    expect(screen.queryByLabelText('inboundEmail.fields.mailgunSigningKey')).not.toBeInTheDocument();
  });

  it('always shows domain field', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'mailgun',
      MAILGUN_SIGNING_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    expect(screen.getByLabelText('inboundEmail.fields.domain')).toBeInTheDocument();
  });

  it('calls saveConfig on form submit', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });
    mockSaveConfig.mockResolvedValue({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('inboundEmail.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('inbound_email', expect.objectContaining({
        RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      }));
    });
  });

  it('shows secret configured status for masked secrets', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: '••••masked',
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    expect(screen.getByText('inboundEmail.secretConfigured')).toBeInTheDocument();
  });

  it('sends null for unmodified secrets on save', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: '••••masked',
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });
    mockSaveConfig.mockResolvedValue({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: '••••masked',
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('inboundEmail.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('inbound_email', expect.objectContaining({
        RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
      }));
    });
  });

  it('does not show test connection button', async () => {
    await renderAndWait();

    expect(screen.queryByText('inboundEmail.testConnection')).not.toBeInTheDocument();
  });

  it('switches fields when changing provider', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    // Password field should be visible for relay
    expect(screen.getByLabelText('inboundEmail.fields.password')).toBeInTheDocument();

    // Switch to mailgun
    const selectTrigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(selectTrigger);
    });
    const mailgunOption = screen.getByRole('option', { name: 'inboundEmail.provider.mailgun' });
    await act(async () => {
      fireEvent.click(mailgunOption);
    });

    // Should now show mailgun signing key instead of password
    expect(screen.getByLabelText('inboundEmail.fields.mailgunSigningKey')).toBeInTheDocument();
    expect(screen.queryByLabelText('inboundEmail.fields.password')).not.toBeInTheDocument();
  });

  it('shows validation error when domain is empty on submit', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: '',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('inboundEmail.save'));
    });

    await waitFor(() => {
      expect(screen.getByText('inboundEmail.validation.domainRequired')).toBeInTheDocument();
    });
    expect(mockSaveConfig).not.toHaveBeenCalled();
  });

  it('shows toast error when save fails', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: null,
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });
    mockSaveConfig.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      fireEvent.click(screen.getByText('inboundEmail.save'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('inboundEmail.messages.saveError', expect.objectContaining({
        description: 'Test error',
      }));
    });
  });

  it('clears secret and marks as modified when clear button is clicked', async () => {
    await renderAndWait({
      RAILS_INBOUND_EMAIL_SERVICE: 'relay',
      RAILS_INBOUND_EMAIL_PASSWORD_SECRET: '••••masked',
      MAILER_INBOUND_EMAIL_DOMAIN: 'reply.example.com',
    });

    // Secret should show as configured
    expect(screen.getByText('inboundEmail.secretConfigured')).toBeInTheDocument();

    // Click clear button
    const clearButton = screen.getByTitle('inboundEmail.clearSecret');
    await act(async () => {
      fireEvent.click(clearButton);
    });

    // After clearing, configured badge should disappear
    expect(screen.queryByText('inboundEmail.secretConfigured')).not.toBeInTheDocument();

    // The password input should be empty
    const passwordInput = screen.getByLabelText('inboundEmail.fields.password') as HTMLInputElement;
    expect(passwordInput.value).toBe('');
  });
});
