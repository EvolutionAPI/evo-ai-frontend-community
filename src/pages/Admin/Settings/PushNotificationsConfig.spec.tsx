import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import PushNotificationsConfig from './PushNotificationsConfig';

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
  FIREBASE_PROJECT_ID: '',
  FIREBASE_CREDENTIALS_SECRET: null,
  IOS_APP_ID: '',
  ANDROID_BUNDLE_ID: '',
}) {
  mockGetConfig.mockImplementation(() => Promise.resolve(mockData));
  await act(async () => {
    render(<PushNotificationsConfig />);
  });
}

describe('PushNotificationsConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<PushNotificationsConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads config from push_notifications endpoint', async () => {
    await renderAndWait();

    expect(mockGetConfig).toHaveBeenCalledWith('push_notifications');
  });

  it('renders title and description', async () => {
    await renderAndWait();

    expect(screen.getByText('pushNotifications.title')).toBeInTheDocument();
    expect(screen.getByText('pushNotifications.fields.cardTitle')).toBeInTheDocument();
    expect(screen.getByText('pushNotifications.description')).toBeInTheDocument();
  });

  it('renders all 4 form fields', async () => {
    await renderAndWait();

    expect(screen.getByLabelText('pushNotifications.fields.projectId')).toBeInTheDocument();
    expect(screen.getByLabelText('pushNotifications.fields.credentialsJson')).toBeInTheDocument();
    expect(screen.getByLabelText('pushNotifications.fields.iosAppId')).toBeInTheDocument();
    expect(screen.getByLabelText('pushNotifications.fields.androidBundleId')).toBeInTheDocument();
  });

  it('shows secret configured status for masked credentials', async () => {
    await renderAndWait({
      FIREBASE_PROJECT_ID: 'my-project',
      FIREBASE_CREDENTIALS_SECRET: '••••masked',
      IOS_APP_ID: '',
      ANDROID_BUNDLE_ID: '',
    });

    expect(screen.getByText('pushNotifications.secretConfigured')).toBeInTheDocument();
  });

  it('shows secret not configured when credentials are empty', async () => {
    await renderAndWait({
      FIREBASE_PROJECT_ID: '',
      FIREBASE_CREDENTIALS_SECRET: null,
      IOS_APP_ID: '',
      ANDROID_BUNDLE_ID: '',
    });

    expect(screen.getByText('pushNotifications.secretNotConfigured')).toBeInTheDocument();
  });

  it('calls saveConfig with push_notifications on form submit', async () => {
    await renderAndWait({
      FIREBASE_PROJECT_ID: 'my-project',
      FIREBASE_CREDENTIALS_SECRET: '••••masked',
      IOS_APP_ID: 'com.example.ios',
      ANDROID_BUNDLE_ID: 'com.example.android',
    });
    mockSaveConfig.mockResolvedValue({
      FIREBASE_PROJECT_ID: 'my-project',
      FIREBASE_CREDENTIALS_SECRET: '••••masked',
      IOS_APP_ID: 'com.example.ios',
      ANDROID_BUNDLE_ID: 'com.example.android',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('pushNotifications.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('push_notifications', expect.objectContaining({
        FIREBASE_PROJECT_ID: 'my-project',
      }));
    });
  });

  it('sends null for unmodified credentials secret on save', async () => {
    await renderAndWait({
      FIREBASE_PROJECT_ID: 'my-project',
      FIREBASE_CREDENTIALS_SECRET: '••••masked',
      IOS_APP_ID: '',
      ANDROID_BUNDLE_ID: '',
    });
    mockSaveConfig.mockResolvedValue({
      FIREBASE_PROJECT_ID: 'my-project',
      FIREBASE_CREDENTIALS_SECRET: '••••masked',
      IOS_APP_ID: '',
      ANDROID_BUNDLE_ID: '',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('pushNotifications.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('push_notifications', expect.objectContaining({
        FIREBASE_CREDENTIALS_SECRET: null,
      }));
    });
  });

  it('uses a textarea for credentials JSON field', async () => {
    await renderAndWait();

    const credentialsField = screen.getByLabelText('pushNotifications.fields.credentialsJson');
    expect(credentialsField.tagName.toLowerCase()).toBe('textarea');
  });

  it('does not render a Test Connection button', async () => {
    await renderAndWait();

    expect(screen.queryByText('pushNotifications.testConnection')).not.toBeInTheDocument();
  });
});
