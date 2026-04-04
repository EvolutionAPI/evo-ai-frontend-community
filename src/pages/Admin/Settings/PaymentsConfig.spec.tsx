import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import PaymentsConfig from './PaymentsConfig';

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
  STRIPE_PUBLISHABLE_KEY: '',
  STRIPE_KEY_SECRET: null,
  STRIPE_WEBHOOK_SECRET: null,
}) {
  mockGetConfig.mockImplementation(() => Promise.resolve(mockData));
  await act(async () => {
    render(<PaymentsConfig />);
  });
}

describe('PaymentsConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<PaymentsConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads config from stripe_payments endpoint', async () => {
    await renderAndWait();

    expect(mockGetConfig).toHaveBeenCalledWith('stripe_payments');
  });

  it('renders title and description', async () => {
    await renderAndWait();

    expect(screen.getByText('payments.title')).toBeInTheDocument();
    expect(screen.getByText('payments.fields.cardTitle')).toBeInTheDocument();
    expect(screen.getByText('payments.description')).toBeInTheDocument();
  });

  it('renders all 3 form fields', async () => {
    await renderAndWait();

    expect(screen.getByLabelText('payments.fields.publishableKey')).toBeInTheDocument();
    expect(screen.getByLabelText('payments.fields.secretKey')).toBeInTheDocument();
    expect(screen.getByLabelText('payments.fields.webhookSecret')).toBeInTheDocument();
  });

  it('shows secret configured status for masked secrets', async () => {
    await renderAndWait({
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_KEY_SECRET: '••••masked',
      STRIPE_WEBHOOK_SECRET: '••••masked',
    });

    const configuredLabels = screen.getAllByText('payments.secretConfigured');
    expect(configuredLabels).toHaveLength(2);
  });

  it('shows secret not configured when secrets are empty', async () => {
    await renderAndWait({
      STRIPE_PUBLISHABLE_KEY: '',
      STRIPE_KEY_SECRET: null,
      STRIPE_WEBHOOK_SECRET: null,
    });

    const notConfiguredLabels = screen.getAllByText('payments.secretNotConfigured');
    expect(notConfiguredLabels).toHaveLength(2);
  });

  it('calls saveConfig with stripe_payments on form submit', async () => {
    await renderAndWait({
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_KEY_SECRET: '••••masked',
      STRIPE_WEBHOOK_SECRET: null,
    });
    mockSaveConfig.mockResolvedValue({
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_KEY_SECRET: '••••masked',
      STRIPE_WEBHOOK_SECRET: null,
    });

    await act(async () => {
      fireEvent.click(screen.getByText('payments.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('stripe_payments', expect.objectContaining({
        STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      }));
    });
  });

  it('sends null for unmodified secrets on save', async () => {
    await renderAndWait({
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_KEY_SECRET: '••••masked',
      STRIPE_WEBHOOK_SECRET: '••••masked',
    });
    mockSaveConfig.mockResolvedValue({
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_KEY_SECRET: '••••masked',
      STRIPE_WEBHOOK_SECRET: '••••masked',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('payments.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('stripe_payments', expect.objectContaining({
        STRIPE_KEY_SECRET: null,
        STRIPE_WEBHOOK_SECRET: null,
      }));
    });
  });

  it('does not render a Test Connection button', async () => {
    await renderAndWait();

    expect(screen.queryByText('payments.testConnection')).not.toBeInTheDocument();
  });
});
