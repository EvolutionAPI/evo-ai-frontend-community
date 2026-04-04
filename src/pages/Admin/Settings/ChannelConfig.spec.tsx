import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import ChannelConfig from './ChannelConfig';

// Radix UI Tabs uses ResizeObserver internally
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

const EMPTY_FACEBOOK = {
  FB_APP_ID: '',
  FB_VERIFY_TOKEN: '',
  FB_APP_SECRET: null,
  FACEBOOK_API_VERSION: '',
  ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: false,
  FB_FEED_COMMENTS_ENABLED: false,
};

const EMPTY_WHATSAPP = {
  WP_APP_ID: '',
  WP_VERIFY_TOKEN: '',
  WP_APP_SECRET: null,
  WP_WHATSAPP_CONFIG_ID: '',
  WP_API_VERSION: '',
};

const EMPTY_INSTAGRAM = {
  INSTAGRAM_APP_ID: '',
  INSTAGRAM_APP_SECRET: null,
  INSTAGRAM_VERIFY_TOKEN: '',
  INSTAGRAM_API_VERSION: '',
  ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT: false,
};

const CONFIGURED_FACEBOOK = {
  FB_APP_ID: 'test-fb-app-id',
  FB_VERIFY_TOKEN: 'test-verify-token',
  FB_APP_SECRET: '••••masked',
  FACEBOOK_API_VERSION: 'v18.0',
  ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: 'true',
  FB_FEED_COMMENTS_ENABLED: 'false',
};

const CONFIGURED_WHATSAPP = {
  WP_APP_ID: 'test-wp-app-id',
  WP_VERIFY_TOKEN: 'test-wp-verify-token',
  WP_APP_SECRET: '••••masked',
  WP_WHATSAPP_CONFIG_ID: 'test-config-id',
  WP_API_VERSION: 'v18.0',
};

const CONFIGURED_INSTAGRAM = {
  INSTAGRAM_APP_ID: 'test-ig-app-id',
  INSTAGRAM_APP_SECRET: '••••masked',
  INSTAGRAM_VERIFY_TOKEN: 'test-ig-verify-token',
  INSTAGRAM_API_VERSION: 'v18.0',
  ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT: 'false',
};

async function renderAndWait(
  fbData: Record<string, unknown> = EMPTY_FACEBOOK,
  wpData: Record<string, unknown> = EMPTY_WHATSAPP,
  igData: Record<string, unknown> = EMPTY_INSTAGRAM,
) {
  mockGetConfig.mockImplementation((type: string) => {
    if (type === 'facebook') return Promise.resolve(fbData);
    if (type === 'whatsapp') return Promise.resolve(wpData);
    if (type === 'instagram') return Promise.resolve(igData);
    return Promise.resolve({});
  });
  await act(async () => {
    render(<ChannelConfig />);
  });
}

describe('ChannelConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ChannelConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads config from facebook, whatsapp, and instagram endpoints', async () => {
    await renderAndWait();

    expect(mockGetConfig).toHaveBeenCalledWith('facebook');
    expect(mockGetConfig).toHaveBeenCalledWith('whatsapp');
    expect(mockGetConfig).toHaveBeenCalledWith('instagram');
  });

  it('renders title and description', async () => {
    await renderAndWait();

    expect(screen.getByText('channels.title')).toBeInTheDocument();
    expect(screen.getByText('channels.description')).toBeInTheDocument();
  });

  it('renders all 3 tab triggers', async () => {
    await renderAndWait();

    expect(screen.getByText('channels.facebook.tabTitle')).toBeInTheDocument();
    expect(screen.getByText('channels.whatsapp.tabTitle')).toBeInTheDocument();
    expect(screen.getByText('channels.instagram.tabTitle')).toBeInTheDocument();
  });

  it('renders Facebook tab fields by default', async () => {
    await renderAndWait();

    expect(screen.getByLabelText('channels.facebook.fields.appId')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.facebook.fields.verifyToken')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.facebook.fields.appSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.facebook.fields.apiVersion')).toBeInTheDocument();
    expect(screen.getByText('channels.facebook.fields.humanAgent')).toBeInTheDocument();
    expect(screen.getByText('channels.facebook.fields.feedComments')).toBeInTheDocument();
  });

  it('renders WhatsApp tab fields when tab is clicked', async () => {
    await renderAndWait();
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.whatsapp.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.whatsapp.fields.appId')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('channels.whatsapp.fields.verifyToken')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.whatsapp.fields.appSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.whatsapp.fields.configId')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.whatsapp.fields.apiVersion')).toBeInTheDocument();
  });

  it('renders Instagram tab fields when tab is clicked', async () => {
    await renderAndWait();
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.instagram.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.instagram.fields.appId')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('channels.instagram.fields.appSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.instagram.fields.verifyToken')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.instagram.fields.apiVersion')).toBeInTheDocument();
    expect(screen.getByText('channels.instagram.fields.humanAgent')).toBeInTheDocument();
  });

  it('shows secret configured status for masked Facebook secret', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);

    const configured = screen.getAllByText('channels.secretConfigured');
    expect(configured.length).toBeGreaterThanOrEqual(1);
  });

  it('shows secret not configured when Facebook secret is empty', async () => {
    await renderAndWait();

    const notConfigured = screen.getAllByText('channels.secretNotConfigured');
    expect(notConfigured.length).toBeGreaterThanOrEqual(1);
  });

  it('saves Facebook tab independently via facebook config type', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        FB_APP_ID: 'test-fb-app-id',
      }));
    });
  });

  it('saves WhatsApp tab independently via whatsapp config type', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);
    mockSaveConfig.mockResolvedValue(CONFIGURED_WHATSAPP);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.whatsapp.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.whatsapp.fields.appId')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('whatsapp', expect.objectContaining({
        WP_APP_ID: 'test-wp-app-id',
      }));
    });
  });

  it('saves Instagram tab independently via instagram config type', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);
    mockSaveConfig.mockResolvedValue(CONFIGURED_INSTAGRAM);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.instagram.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.instagram.fields.appId')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('instagram', expect.objectContaining({
        INSTAGRAM_APP_ID: 'test-ig-app-id',
      }));
    });
  });

  it('sends null for unmodified secrets on Facebook save', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        FB_APP_SECRET: null,
      }));
    });
  });

  it('shows error toast when Facebook save fails', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);
    mockSaveConfig.mockRejectedValue(new Error('Network error'));

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('channels.facebook.saveError', {
        description: 'Test error',
      });
    });
  });

  it('shows error toast when load fails', async () => {
    mockGetConfig.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(<ChannelConfig />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('channels.messages.loadError');
    });
  });

  it('sends modified secret value on save after typing', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const secretInput = screen.getByLabelText('channels.facebook.fields.appSecret');

    await act(async () => {
      fireEvent.change(secretInput, { target: { value: 'new-secret-value' } });
    });

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        FB_APP_SECRET: 'new-secret-value',
      }));
    });
  });

  it('clear secret button marks secret as modified', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);

    const clearButtons = screen.getAllByTitle('channels.clearSecret');
    expect(clearButtons.length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      fireEvent.click(clearButtons[0]);
    });

    // After clearing, the configured status should disappear for that field
    const remaining = screen.queryAllByText('channels.secretConfigured');
    // There should be fewer configured indicators now (or none if only one was shown)
    expect(remaining.length).toBe(0);
  });

  it('renders toggle fields as switches for boolean values', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);

    // Facebook has 2 toggle fields
    expect(screen.getByText('channels.facebook.fields.humanAgent')).toBeInTheDocument();
    expect(screen.getByText('channels.facebook.fields.feedComments')).toBeInTheDocument();

    // Switches should be rendered (role=switch)
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(2);
  });

  it('sends boolean values on Facebook save with toggles', async () => {
    await renderAndWait(CONFIGURED_FACEBOOK, CONFIGURED_WHATSAPP, CONFIGURED_INSTAGRAM);
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: true,
        FB_FEED_COMMENTS_ENABLED: false,
      }));
    });
  });
});
