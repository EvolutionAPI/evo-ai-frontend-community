import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useWidgetConfig } from './useWidgetConfig';
import type { WidgetConfiguration } from '@/types/settings';

const TRANSLATED = {
  'replyTimeStatus.inAFewMinutes': 'We will respond in a few minutes',
  'replyTimeStatus.inAFewHours': 'We will respond in a few hours',
  'replyTimeStatus.inADay': 'We will respond in a day',
  'businessHours.backTomorrow': "We'll be back tomorrow",
  'businessHours.offline': 'Team offline',
} as Record<string, string>;

const mockT = vi.fn((key: string, options?: Record<string, string>) => {
  if (key === 'businessHours.backAt' && options?.time) {
    return `We'll be back at ${options.time}`;
  }
  return TRANSLATED[key] ?? key;
});

const buildConfig = (overrides: Partial<WidgetConfiguration> = {}): WidgetConfiguration => ({
  avatarUrl: '',
  hasAConnectedAgentBot: '',
  locale: 'en',
  websiteName: 'Test',
  websiteToken: 'token',
  welcomeTagline: '',
  welcomeTitle: '',
  widgetColor: '#000',
  enabledFeatures: [],
  enabledLanguages: [],
  replyTime: 'in_a_few_hours',
  workingHoursEnabled: false,
  workingHours: [],
  outOfOfficeMessage: '',
  utcOffset: '-03:00',
  timezone: 'America/Sao_Paulo',
  preChatFormEnabled: false,
  preChatFormOptions: { pre_chat_message: '', pre_chat_fields: [] },
  allowMessagesAfterResolved: true,
  csatSurveyEnabled: false,
  disableBranding: false,
  ...overrides,
});

describe('useWidgetConfig', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe('replyWaitMessage — reply time i18n (AC 3)', () => {
    it('returns translated string for replyTime "in_a_few_minutes"', () => {
      const { result } = renderHook(() =>
        useWidgetConfig({ config: buildConfig({ replyTime: 'in_a_few_minutes' }), t: mockT }),
      );

      expect(result.current.replyWaitMessage).toBe('We will respond in a few minutes');
      expect(mockT).toHaveBeenCalledWith('replyTimeStatus.inAFewMinutes');
    });

    it('returns translated string for replyTime "in_a_few_hours"', () => {
      const { result } = renderHook(() =>
        useWidgetConfig({ config: buildConfig({ replyTime: 'in_a_few_hours' }), t: mockT }),
      );

      expect(result.current.replyWaitMessage).toBe('We will respond in a few hours');
      expect(mockT).toHaveBeenCalledWith('replyTimeStatus.inAFewHours');
    });

    it('returns translated string for replyTime "in_a_day"', () => {
      const { result } = renderHook(() =>
        useWidgetConfig({ config: buildConfig({ replyTime: 'in_a_day' }), t: mockT }),
      );

      expect(result.current.replyWaitMessage).toBe('We will respond in a day');
      expect(mockT).toHaveBeenCalledWith('replyTimeStatus.inADay');
    });

    it('falls back to "in_a_few_hours" translation for unknown replyTime', () => {
      const { result } = renderHook(() =>
        useWidgetConfig({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: buildConfig({ replyTime: 'unknown_value' as any }),
          t: mockT,
        }),
      );

      expect(result.current.replyWaitMessage).toBe('We will respond in a few hours');
    });

    it('never returns a raw i18n key as replyWaitMessage', () => {
      const replyTimeValues: Array<WidgetConfiguration['replyTime']> = [
        'in_a_few_minutes',
        'in_a_few_hours',
        'in_a_day',
      ];

      for (const replyTime of replyTimeValues) {
        const { result } = renderHook(() =>
          useWidgetConfig({ config: buildConfig({ replyTime }), t: mockT }),
        );

        expect(result.current.replyWaitMessage).not.toMatch(/^[a-z]+\.[a-z]/);
        expect(result.current.replyWaitMessage.length).toBeGreaterThan(0);
      }
    });
  });

  describe('replyWaitMessage — business hours i18n', () => {
    it('returns "Team offline" when outside business hours and workingHours disabled', () => {
      const config = buildConfig({
        workingHoursEnabled: false,
        workingHours: [{
          day_of_week: new Date().getDay(),
          closed_all_day: true,
          open_all_day: false,
          open_hour: 0, open_minutes: 0,
          close_hour: 0, close_minutes: 0,
        }],
      });

      const { result } = renderHook(() => useWidgetConfig({ config, t: mockT }));

      expect(result.current.isInBusinessHours).toBe(true);
      expect(result.current.replyWaitMessage).toBe('We will respond in a few hours');
    });

    it('returns back-tomorrow message when closed all day with workingHours enabled', () => {
      const config = buildConfig({
        workingHoursEnabled: true,
        workingHours: [{
          day_of_week: new Date().getDay(),
          closed_all_day: true,
          open_all_day: false,
          open_hour: 0, open_minutes: 0,
          close_hour: 0, close_minutes: 0,
        }],
      });

      const { result } = renderHook(() => useWidgetConfig({ config, t: mockT }));

      expect(result.current.isInBusinessHours).toBe(false);
      expect(result.current.replyWaitMessage).toBe("We'll be back tomorrow");
      expect(mockT).toHaveBeenCalledWith('businessHours.backTomorrow');
    });

    it('returns "Team offline" via t() when not in business hours and workingHours disabled', () => {
      const config = buildConfig({ workingHoursEnabled: false });

      const offlineT = vi.fn((key: string) => {
        if (key === 'businessHours.offline') return 'Team offline';
        return TRANSLATED[key] ?? key;
      });

      const { result } = renderHook(() => useWidgetConfig({ config, t: offlineT }));

      expect(result.current.replyWaitMessage).not.toMatch(/^businessHours\./);
    });
  });

  describe('replyWaitMessage — regression guard', () => {
    it('calls t() function for every replyTime value (no hardcoded strings)', () => {
      const spyT = vi.fn((key: string, opts?: Record<string, string>) => {
        if (key === 'businessHours.backAt' && opts?.time) return `back at ${opts.time}`;
        return `translated:${key}`;
      });

      const values: Array<WidgetConfiguration['replyTime']> = [
        'in_a_few_minutes',
        'in_a_few_hours',
        'in_a_day',
      ];

      for (const replyTime of values) {
        spyT.mockClear();
        const { result } = renderHook(() =>
          useWidgetConfig({ config: buildConfig({ replyTime }), t: spyT }),
        );

        expect(result.current.replyWaitMessage).toMatch(/^translated:/);

        const replyTimeCalls = spyT.mock.calls.filter(([k]) =>
          (k as string).startsWith('replyTimeStatus.'),
        );
        expect(replyTimeCalls.length).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
