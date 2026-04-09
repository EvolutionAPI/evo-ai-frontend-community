import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import FrontendRuntimeConfig from './FrontendRuntimeConfig';

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
  RECAPTCHA_SITE_KEY: '',
  CLARITY_PROJECT_ID: '',
}) {
  mockGetConfig.mockImplementation(() => Promise.resolve(mockData));
  await act(async () => {
    render(<FrontendRuntimeConfig />);
  });
}

describe('FrontendRuntimeConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<FrontendRuntimeConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads config from frontend_runtime endpoint', async () => {
    await renderAndWait();

    expect(mockGetConfig).toHaveBeenCalledWith('frontend_runtime');
  });

  it('renders title and description', async () => {
    await renderAndWait();

    expect(screen.getByText('frontendRuntime.title')).toBeInTheDocument();
    expect(screen.getByText('frontendRuntime.fields.cardTitle')).toBeInTheDocument();
    expect(screen.getByText('frontendRuntime.description')).toBeInTheDocument();
  });

  it('renders both form fields', async () => {
    await renderAndWait();

    expect(screen.getByLabelText('frontendRuntime.fields.recaptchaSiteKey')).toBeInTheDocument();
    expect(screen.getByLabelText('frontendRuntime.fields.clarityProjectId')).toBeInTheDocument();
  });

  it('populates fields with loaded config values', async () => {
    await renderAndWait({
      RECAPTCHA_SITE_KEY: '6Lc_test_key',
      CLARITY_PROJECT_ID: 'clarity_test_id',
    });

    expect(screen.getByLabelText('frontendRuntime.fields.recaptchaSiteKey')).toHaveValue('6Lc_test_key');
    expect(screen.getByLabelText('frontendRuntime.fields.clarityProjectId')).toHaveValue('clarity_test_id');
  });

  it('calls saveConfig with frontend_runtime on form submit', async () => {
    await renderAndWait({
      RECAPTCHA_SITE_KEY: '6Lc_test_key',
      CLARITY_PROJECT_ID: 'clarity_test_id',
    });
    mockSaveConfig.mockResolvedValue({
      RECAPTCHA_SITE_KEY: '6Lc_test_key',
      CLARITY_PROJECT_ID: 'clarity_test_id',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('frontendRuntime.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('frontend_runtime', expect.objectContaining({
        RECAPTCHA_SITE_KEY: '6Lc_test_key',
        CLARITY_PROJECT_ID: 'clarity_test_id',
      }));
    });
  });
});
