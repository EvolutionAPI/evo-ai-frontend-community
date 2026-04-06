import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import WhitelabelConfig from './WhitelabelConfig';

// Radix UI Switch uses ResizeObserver internally
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

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

const EMPTY_DATA: Record<string, unknown> = {
  WHITELABEL_ENABLED: false,
  WHITELABEL_LOGO_LIGHT: '',
  WHITELABEL_LOGO_DARK: '',
  WHITELABEL_PRIMARY_COLOR_LIGHT: '',
  WHITELABEL_PRIMARY_COLOR_DARK: '',
  WHITELABEL_PRIMARY_FOREGROUND_LIGHT: '',
  WHITELABEL_PRIMARY_FOREGROUND_DARK: '',
  WHITELABEL_COMPANY_NAME: '',
  WHITELABEL_SYSTEM_NAME: '',
  WHITELABEL_TERMS_OF_SERVICE_URL: '',
  WHITELABEL_PRIVACY_POLICY_URL: '',
};

async function renderAndWait(mockData: Record<string, unknown> = EMPTY_DATA) {
  mockGetConfig.mockImplementation(() => Promise.resolve(mockData));
  await act(async () => {
    render(<WhitelabelConfig />);
  });
}

describe('WhitelabelConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<WhitelabelConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads config from whitelabel endpoint', async () => {
    await renderAndWait();

    expect(mockGetConfig).toHaveBeenCalledWith('whitelabel');
  });

  it('renders title and description', async () => {
    await renderAndWait();

    expect(screen.getByText('whitelabel.title')).toBeInTheDocument();
    expect(screen.getByText('whitelabel.description')).toBeInTheDocument();
  });

  it('renders the enable/disable toggle', async () => {
    await renderAndWait();

    expect(screen.getByText('whitelabel.fields.enabled')).toBeInTheDocument();
  });

  it('renders all section cards', async () => {
    await renderAndWait();

    expect(screen.getByText('whitelabel.sections.logos')).toBeInTheDocument();
    expect(screen.getByText('whitelabel.sections.colors')).toBeInTheDocument();
    expect(screen.getByText('whitelabel.sections.branding')).toBeInTheDocument();
    expect(screen.getByText('whitelabel.sections.legal')).toBeInTheDocument();
  });

  it('renders all 10 input fields', async () => {
    await renderAndWait();

    expect(screen.getByLabelText('whitelabel.fields.logoLight')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.logoDark')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.primaryColorLight')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.primaryColorDark')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.foregroundLight')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.foregroundDark')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.companyName')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.systemName')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.termsUrl')).toBeInTheDocument();
    expect(screen.getByLabelText('whitelabel.fields.privacyUrl')).toBeInTheDocument();
  });

  it('marks branding sections as inert when whitelabel is disabled', async () => {
    await renderAndWait({ ...EMPTY_DATA, WHITELABEL_ENABLED: false });

    const inertElements = document.querySelectorAll('[inert]');
    expect(inertElements.length).toBe(4);
  });

  it('does not mark branding sections as inert when whitelabel is enabled', async () => {
    await renderAndWait({ ...EMPTY_DATA, WHITELABEL_ENABLED: 'true' });

    const inertElements = document.querySelectorAll('[inert]');
    expect(inertElements.length).toBe(0);
  });

  it('calls saveConfig with whitelabel on form submit', async () => {
    await renderAndWait({ ...EMPTY_DATA, WHITELABEL_COMPANY_NAME: 'TestCo' });
    mockSaveConfig.mockResolvedValue({ ...EMPTY_DATA, WHITELABEL_COMPANY_NAME: 'TestCo' });

    await act(async () => {
      fireEvent.click(screen.getByText('whitelabel.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('whitelabel', expect.objectContaining({
        WHITELABEL_COMPANY_NAME: 'TestCo',
      }));
    });
  });

  it('shows validation error for invalid terms URL', async () => {
    await renderAndWait();
    mockSaveConfig.mockResolvedValue(EMPTY_DATA);

    const termsInput = screen.getByLabelText('whitelabel.fields.termsUrl');
    await act(async () => {
      fireEvent.change(termsInput, { target: { value: 'not-a-url' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('whitelabel.save'));
    });

    await waitFor(() => {
      expect(screen.getByText('whitelabel.validation.invalidUrl')).toBeInTheDocument();
    });
  });

  it('accepts empty string for URL fields', async () => {
    await renderAndWait();
    mockSaveConfig.mockResolvedValue(EMPTY_DATA);

    await act(async () => {
      fireEvent.click(screen.getByText('whitelabel.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalled();
    });
  });

  it('does not render a Test Connection button', async () => {
    await renderAndWait();

    expect(screen.queryByText('whitelabel.testConnection')).not.toBeInTheDocument();
  });

  it('shows toast error when config fails to load', async () => {
    const { toast } = await import('sonner');
    mockGetConfig.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(<WhitelabelConfig />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('whitelabel.messages.loadError');
    });
  });

  it('shows toast error when save fails', async () => {
    const { toast } = await import('sonner');
    await renderAndWait({ ...EMPTY_DATA, WHITELABEL_ENABLED: 'true' });
    mockSaveConfig.mockRejectedValue(new Error('Save failed'));

    await act(async () => {
      fireEvent.click(screen.getByText('whitelabel.save'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('whitelabel.messages.saveError', {
        description: 'Test error',
      });
    });
  });
});
