import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();
const createMock = vi.fn(() => ({ post: postMock }));
const changeLanguageMock = vi.fn().mockResolvedValue(undefined);
const i18nMock = { language: 'en', changeLanguage: changeLanguageMock };

vi.mock('axios', () => ({
  default: { create: createMock },
  create: createMock,
}));

vi.mock('@/i18n/config', () => ({
  default: i18nMock,
}));

describe('widgetService.getConfig locale handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    i18nMock.language = 'en';
  });

  it('normalizes pt_BR to pt-BR and updates language once', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        website_channel_config: {
          auth_token: 'auth-token',
          locale: 'pt_BR',
          pre_chat_form_enabled: false,
          pre_chat_form_options: {},
          enabled_features: ['attachments'],
          allow_messages_after_resolved: true,
        },
      },
    });

    const { widgetService } = await import('./widgetService');
    const result = await widgetService.getConfig('website-token');

    expect(result.locale).toBe('pt-BR');
    expect(changeLanguageMock).toHaveBeenCalledTimes(1);
    expect(changeLanguageMock).toHaveBeenCalledWith('pt-BR');
  });

  it('does not call changeLanguage when normalized locale equals current language', async () => {
    i18nMock.language = 'pt-BR';
    postMock.mockResolvedValueOnce({
      data: {
        website_channel_config: {
          auth_token: 'auth-token',
          locale: 'pt_BR',
          pre_chat_form_enabled: false,
          pre_chat_form_options: {},
        },
      },
    });

    const { widgetService } = await import('./widgetService');
    const result = await widgetService.getConfig('website-token');

    expect(result.locale).toBe('pt-BR');
    expect(changeLanguageMock).not.toHaveBeenCalled();
  });
});
