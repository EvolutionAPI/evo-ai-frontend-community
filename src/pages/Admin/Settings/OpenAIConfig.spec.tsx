import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import OpenAIConfig from './OpenAIConfig';

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

const EMPTY_CONFIG: Record<string, unknown> = {
  OPENAI_API_URL: '',
  OPENAI_API_SECRET: null,
  OPENAI_MODEL: '',
  OPENAI_ENABLE_AUDIO_TRANSCRIPTION: false,
  OPENAI_PROMPT_REPLY: '',
  OPENAI_PROMPT_SUMMARY: '',
  OPENAI_PROMPT_REPHRASE: '',
  OPENAI_PROMPT_FIX_GRAMMAR: '',
  OPENAI_PROMPT_SHORTEN: '',
  OPENAI_PROMPT_EXPAND: '',
  OPENAI_PROMPT_FRIENDLY: '',
  OPENAI_PROMPT_FORMAL: '',
  OPENAI_PROMPT_SIMPLIFY: '',
};

async function renderAndWait(mockData: Record<string, unknown> = EMPTY_CONFIG) {
  mockGetConfig.mockImplementation(() => Promise.resolve(mockData));
  await act(async () => {
    render(<OpenAIConfig />);
  });
}

describe('OpenAIConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}));
    const { container } = render(<OpenAIConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads config from openai endpoint', async () => {
    await renderAndWait();

    expect(mockGetConfig).toHaveBeenCalledWith('openai');
  });

  it('renders title and description', async () => {
    await renderAndWait();

    expect(screen.getByText('openai.title')).toBeInTheDocument();
    expect(screen.getByText('openai.description')).toBeInTheDocument();
  });

  it('renders connection settings card', async () => {
    await renderAndWait();

    expect(screen.getByText('openai.connection.cardTitle')).toBeInTheDocument();
    expect(screen.getByLabelText('openai.connection.fields.apiUrl')).toBeInTheDocument();
    expect(screen.getByLabelText('openai.connection.fields.apiSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('openai.connection.fields.model')).toBeInTheDocument();
  });

  it('renders audio transcription toggle', async () => {
    await renderAndWait();

    expect(screen.getByText('openai.connection.fields.audioTranscription')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders all 9 prompt textarea fields', async () => {
    await renderAndWait();

    expect(screen.getByText('openai.prompts.cardTitle')).toBeInTheDocument();

    const promptKeys = [
      'OPENAI_PROMPT_REPLY', 'OPENAI_PROMPT_SUMMARY', 'OPENAI_PROMPT_REPHRASE',
      'OPENAI_PROMPT_FIX_GRAMMAR', 'OPENAI_PROMPT_SHORTEN', 'OPENAI_PROMPT_EXPAND',
      'OPENAI_PROMPT_FRIENDLY', 'OPENAI_PROMPT_FORMAL', 'OPENAI_PROMPT_SIMPLIFY',
    ];

    for (const key of promptKeys) {
      expect(screen.getByText(`openai.prompts.fields.${key}`)).toBeInTheDocument();
    }

    const textareas = screen.getAllByRole('textbox');
    // 3 connection inputs (apiUrl, apiSecret, model) + 9 prompt textareas = 12
    // But apiSecret is type="password" so not counted as textbox
    // So: 2 inputs + 9 textareas = 11 textboxes
    expect(textareas.length).toBeGreaterThanOrEqual(9);
  });

  it('shows secret configured status for masked secret', async () => {
    await renderAndWait({
      ...EMPTY_CONFIG,
      OPENAI_API_SECRET: '••••masked',
    });

    expect(screen.getByText('openai.secretConfigured')).toBeInTheDocument();
  });

  it('shows secret not configured when secret is empty', async () => {
    await renderAndWait();

    expect(screen.getByText('openai.secretNotConfigured')).toBeInTheDocument();
  });

  it('calls saveConfig with openai on form submit', async () => {
    await renderAndWait({
      ...EMPTY_CONFIG,
      OPENAI_API_URL: 'https://api.openai.com/v1',
      OPENAI_MODEL: 'gpt-4o',
    });
    mockSaveConfig.mockResolvedValue({
      ...EMPTY_CONFIG,
      OPENAI_API_URL: 'https://api.openai.com/v1',
      OPENAI_MODEL: 'gpt-4o',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('openai.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('openai', expect.objectContaining({
        OPENAI_API_URL: 'https://api.openai.com/v1',
        OPENAI_MODEL: 'gpt-4o',
      }));
    });
  });

  it('sends null for unmodified secret on save', async () => {
    await renderAndWait({
      ...EMPTY_CONFIG,
      OPENAI_API_SECRET: '••••masked',
    });
    mockSaveConfig.mockResolvedValue({
      ...EMPTY_CONFIG,
      OPENAI_API_SECRET: '••••masked',
    });

    await act(async () => {
      fireEvent.click(screen.getByText('openai.save'));
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('openai', expect.objectContaining({
        OPENAI_API_SECRET: null,
      }));
    });
  });
});
