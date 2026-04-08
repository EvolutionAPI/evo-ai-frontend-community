import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import StorageConfig from './StorageConfig';

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
const mockTestConnection = vi.fn();

vi.mock('@/services/admin/adminConfigService', () => ({
  adminConfigService: {
    getConfig: (...args: unknown[]) => mockGetConfig(...args),
    saveConfig: (...args: unknown[]) => mockSaveConfig(...args),
    testConnection: (...args: unknown[]) => mockTestConnection(...args),
  },
}));

vi.mock('@/utils/apiHelpers', () => ({
  extractError: () => ({ message: 'Test error' }),
}));

async function renderAndWait(mockData: Record<string, unknown> = { ACTIVE_STORAGE_SERVICE: 'local' }) {
  mockGetConfig.mockImplementation(() => Promise.resolve(mockData));
  await act(async () => {
    render(<StorageConfig />);
  });
}

describe('StorageConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Radix UI Select calls scrollIntoView which jsdom doesn't implement
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<StorageConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads and displays local storage config', async () => {
    await renderAndWait();

    expect(screen.getByText('storage.title')).toBeInTheDocument();
    expect(screen.getByText('storage.description')).toBeInTheDocument();
    expect(mockGetConfig).toHaveBeenCalledWith('storage');
  });

  it('hides cloud fields when local is selected', async () => {
    await renderAndWait();

    expect(screen.queryByLabelText('storage.fields.bucketName')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('storage.fields.accessKeyId')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('storage.fields.region')).not.toBeInTheDocument();
  });

  it('hides Test Connection button when local is selected', async () => {
    await renderAndWait();

    expect(screen.queryByText('storage.testConnection')).not.toBeInTheDocument();
  });

  it('shows cloud fields when amazon is loaded', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });

    expect(screen.getByLabelText('storage.fields.bucketName')).toBeInTheDocument();
    expect(screen.getByLabelText('storage.fields.accessKeyId')).toBeInTheDocument();
    expect(screen.getByLabelText('storage.fields.region')).toBeInTheDocument();
    expect(screen.getByLabelText('storage.fields.endpoint')).toBeInTheDocument();
    expect(screen.getByText('storage.testConnection')).toBeInTheDocument();
  });

  it('shows Test Connection button for cloud providers', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 's3_compatible',
      STORAGE_BUCKET_NAME: '',
      STORAGE_ACCESS_KEY_ID: '',
      STORAGE_ACCESS_SECRET: null,
      STORAGE_REGION: '',
      STORAGE_ENDPOINT: '',
    });

    expect(screen.getByText('storage.testConnection')).toBeInTheDocument();
  });

  it('calls saveConfig on form submit', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });
    mockSaveConfig.mockResolvedValue({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('storage.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('storage', expect.objectContaining({
        ACTIVE_STORAGE_SERVICE: 'amazon',
        STORAGE_BUCKET_NAME: 'my-bucket',
      }));
    });
  });

  it('calls testConnection when Test Connection button is clicked', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });
    mockTestConnection.mockResolvedValue({ success: true, message: 'Connected!' });

    await act(async () => {
      fireEvent.click(screen.getByText('storage.testConnection'));
    });

    await waitFor(() => {
      expect(mockTestConnection).toHaveBeenCalledWith('storage');
    });
  });

  it('shows secret configured status for masked secrets', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });

    expect(screen.getByText('storage.secretConfigured')).toBeInTheDocument();
  });

  it('preserves shared fields when switching between cloud providers', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });

    // Bucket should have value from amazon config
    const bucketInput = screen.getByLabelText('storage.fields.bucketName') as HTMLInputElement;
    expect(bucketInput.value).toBe('my-bucket');

    // Switch to s3_compatible via Radix Select
    const selectTrigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(selectTrigger);
    });
    const s3Option = screen.getByRole('option', { name: 'storage.provider.s3Compatible' });
    await act(async () => {
      fireEvent.click(s3Option);
    });

    // Bucket should still have value after switching
    const bucketAfterSwitch = screen.getByLabelText('storage.fields.bucketName') as HTMLInputElement;
    expect(bucketAfterSwitch.value).toBe('my-bucket');
  });

  it('resets fields when switching from cloud to local', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });

    // Switch to local via Radix Select
    const selectTrigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(selectTrigger);
    });
    const localOption = screen.getByRole('option', { name: 'storage.provider.local' });
    await act(async () => {
      fireEvent.click(localOption);
    });

    // Cloud fields should be hidden
    expect(screen.queryByLabelText('storage.fields.bucketName')).not.toBeInTheDocument();
  });

  it('sends null for unmodified secrets on save', async () => {
    await renderAndWait({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });
    mockSaveConfig.mockResolvedValue({
      ACTIVE_STORAGE_SERVICE: 'amazon',
      STORAGE_BUCKET_NAME: 'my-bucket',
      STORAGE_ACCESS_KEY_ID: 'AKIA123',
      STORAGE_ACCESS_SECRET: '••••masked',
      STORAGE_REGION: 'us-east-1',
      STORAGE_ENDPOINT: '',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('storage.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('storage', expect.objectContaining({
        STORAGE_ACCESS_SECRET: null,
      }));
    });
  });
});
