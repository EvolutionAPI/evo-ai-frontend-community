import { useMemo } from 'react';
import type { WidgetConfiguration, WidgetConfigHook, ConversationStatus } from '@/types/settings';

type TFunction = (key: string, options?: Record<string, string>) => string;

interface UseWidgetConfigProps {
  config: WidgetConfiguration;
  conversationStatus?: ConversationStatus;
  hasEmail?: boolean;
  t: TFunction;
}

// Helper function to check if current time is after start time
function isTimeAfter(
  currentHour: number,
  currentMinute: number,
  targetHour: number,
  targetMinute: number
): boolean {
  if (currentHour > targetHour) return true;
  if (currentHour === targetHour && currentMinute >= targetMinute) return true;
  return false;
}

export function useWidgetConfig({
  config,
  conversationStatus = 'open',
  hasEmail = false,
  t
}: UseWidgetConfigProps): WidgetConfigHook {

  return useMemo(() => {
    // Feature flags - provide safe defaults if config isn't loaded yet
    const enabledFeatures = config.enabledFeatures || [];
    const hasEmojiPickerEnabled = enabledFeatures.includes('emoji_picker');
    const hasAttachmentsEnabled = enabledFeatures.includes('attachments');
    const hasEndConversationEnabled = true;
    const useInboxAvatarForBot = enabledFeatures.includes('use_inbox_avatar_for_bot');

    // Current day availability - provide safe defaults (simplified without timezone for now)
    const workingHours = config.workingHours || [];

    const currentDate = new Date(); // Use local time for now
    const dayOfTheWeek = currentDate.getDay();
    const workingHourConfig = workingHours.find(
      wh => wh.day_of_week === dayOfTheWeek
    );

    const currentDayAvailability = {
      closedAllDay: workingHourConfig?.closed_all_day ?? false,
      openAllDay: workingHourConfig?.open_all_day ?? true,
      openHour: workingHourConfig?.open_hour ?? 9,
      openMinute: workingHourConfig?.open_minutes ?? 0,
      closeHour: workingHourConfig?.close_hour ?? 18,
      closeMinute: workingHourConfig?.close_minutes ?? 0,
    };

    // Check if currently in business hours
    const isInBetweenWorkingHours = (() => {
      if (currentDayAvailability.openAllDay) return true;
      if (currentDayAvailability.closedAllDay) return false;

      const currentHours = currentDate.getHours();
      const currentMinutes = currentDate.getMinutes();

      const isAfterStartTime = isTimeAfter(
        currentHours,
        currentMinutes,
        currentDayAvailability.openHour,
        currentDayAvailability.openMinute
      );

      const isBeforeEndTime = isTimeAfter(
        currentDayAvailability.closeHour,
        currentDayAvailability.closeMinute,
        currentHours,
        currentMinutes
      );

      return isAfterStartTime && isBeforeEndTime;
    })();

    const isInBusinessHours = (config.workingHoursEnabled ?? false) ? isInBetweenWorkingHours : true;

    const getReplyTimeStatus = () => {
      switch (config.replyTime) {
        case 'in_a_few_minutes':
          return t('replyTimeStatus.inAFewMinutes');
        case 'in_a_few_hours':
          return t('replyTimeStatus.inAFewHours');
        case 'in_a_day':
          return t('replyTimeStatus.inADay');
        default:
          return t('replyTimeStatus.inAFewHours');
      }
    };

    const timeLeftToBackInOnline = (() => {
      if (isInBusinessHours) return '';

      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (currentDayAvailability.closedAllDay) {
        return t('businessHours.backTomorrow');
      }

      const nextOpenTime = `${String(currentDayAvailability.openHour).padStart(2, '0')}:${String(currentDayAvailability.openMinute).padStart(2, '0')}`;
      return t('businessHours.backAt', { time: nextOpenTime });
    })();

    const replyWaitMessage = (() => {
      if (config.workingHoursEnabled) {
        return isInBusinessHours
          ? getReplyTimeStatus()
          : timeLeftToBackInOnline;
      }
      return isInBusinessHours
        ? getReplyTimeStatus()
        : t('businessHours.offline');
    })();

    // Pre-chat form logic
    const preChatFields = config.preChatFormOptions?.pre_chat_fields || [];
    const hasEnabledFields = preChatFields.filter(field => field.enabled).length > 0;
    const shouldShowPreChatForm = (config.preChatFormEnabled ?? false) && hasEnabledFields;

    // Conversation helpers - import CONVERSATION_STATUS values
    const CONVERSATION_STATUS_VALUES = {
      OPEN: 'open' as const,
      RESOLVED: 'resolved' as const,
      PENDING: 'pending' as const,
      SNOOZED: 'snoozed' as const,
    };

    const hideReplyBox = conversationStatus === CONVERSATION_STATUS_VALUES.RESOLVED;
    const showEmailTranscriptButton = hasEmail;

    // Can end conversation if status is open, pending, or snoozed
    const canEndConversation = [
      CONVERSATION_STATUS_VALUES.OPEN,
      CONVERSATION_STATUS_VALUES.PENDING,
      CONVERSATION_STATUS_VALUES.SNOOZED,
    ].includes(conversationStatus as any);

    return {
      // Feature flags
      hasEmojiPickerEnabled,
      hasAttachmentsEnabled,
      hasEndConversationEnabled,
      useInboxAvatarForBot,

      // Availability
      isInBusinessHours,
      replyWaitMessage,
      outOfOfficeMessage: config.outOfOfficeMessage || '',

      // Pre-chat
      shouldShowPreChatForm,

      // Working hours
      currentDayAvailability,

      // Conversation
      hideReplyBox,
      showEmailTranscriptButton,
      canEndConversation,
    };
  }, [config, conversationStatus, hasEmail, t]);
}
