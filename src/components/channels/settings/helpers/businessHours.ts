import { parse, getHours, getMinutes, differenceInMinutes } from 'date-fns';
import i18n from '@/i18n/config';

// Types
export interface TimeSlot {
  day: number;
  from: string;
  to: string;
  valid: boolean;
  openAllDay?: boolean;
}

export interface BusinessHourSlot {
  day_of_week: number;
  closed_all_day: boolean;
  open_hour: number;
  open_minutes: number;
  close_hour: number;
  close_minutes: number;
  open_all_day: boolean;
}

export interface TimeZone {
  label: string;
  value: string;
}

// Default time slots for all days (disabled by default)
export const defaultTimeSlot: TimeSlot[] = [
  { day: 0, to: '', from: '', valid: false }, // Sunday
  { day: 1, to: '', from: '', valid: false }, // Monday
  { day: 2, to: '', from: '', valid: false }, // Tuesday
  { day: 3, to: '', from: '', valid: false }, // Wednesday
  { day: 4, to: '', from: '', valid: false }, // Thursday
  { day: 5, to: '', from: '', valid: false }, // Friday
  { day: 6, to: '', from: '', valid: false }, // Saturday
];

// Day names mapping
export const getDayNames = (): Record<number, string> => ({
  0: i18n.t('channels:settings.businessHours.days.sunday'),
  1: i18n.t('channels:settings.businessHours.days.monday'),
  2: i18n.t('channels:settings.businessHours.days.tuesday'),
  3: i18n.t('channels:settings.businessHours.days.wednesday'),
  4: i18n.t('channels:settings.businessHours.days.thursday'),
  5: i18n.t('channels:settings.businessHours.days.friday'),
  6: i18n.t('channels:settings.businessHours.days.saturday'),
});

// Generate time slots with specified step (in minutes)
export const generateTimeSlots = (step = 30): string[] => {
  const date = new Date(1970, 1, 1);
  const slots: string[] = [];

  while (date.getDate() === 1) {
    slots.push(
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    );
    date.setMinutes(date.getMinutes() + step);
  }

  return slots;
};

// Convert hour and minute to time string
export const getTime = (hour: number, minute: number): string => {
  const meridian = hour > 11 ? 'PM' : 'AM';
  const modHour = hour > 12 ? hour % 12 : hour || 12;
  const parsedHour = modHour < 10 ? `0${modHour}` : modHour;
  const parsedMinute = minute < 10 ? `0${minute}` : minute;
  return `${parsedHour}:${parsedMinute} ${meridian}`;
};

// Parse business hours from API format to UI format
export const timeSlotParse = (timeSlots: BusinessHourSlot[]): TimeSlot[] => {
  return timeSlots.map(slot => {
    const {
      day_of_week: day,
      open_hour: openHour,
      open_minutes: openMinutes,
      close_hour: closeHour,
      close_minutes: closeMinutes,
      closed_all_day: closedAllDay,
      open_all_day: openAllDay,
    } = slot;

    const from = closedAllDay ? '' : getTime(openHour, openMinutes);
    const to = closedAllDay ? '' : getTime(closeHour, closeMinutes);

    return {
      day,
      to,
      from,
      valid: !closedAllDay,
      openAllDay,
    };
  });
};

// Transform UI format to API format
export const timeSlotTransform = (timeSlots: TimeSlot[]): BusinessHourSlot[] => {
  return timeSlots.map(slot => {
    const closed = slot.openAllDay ? false : !(slot.to && slot.from);
    const openAllDay = slot.openAllDay || false;
    let openHour = 0;
    let openMinutes = 0;
    let closeHour = 0;
    let closeMinutes = 0;

    if (!closed && slot.from && slot.to) {
      openHour = getHours(parse(slot.from, 'hh:mm a', new Date()));
      openMinutes = getMinutes(parse(slot.from, 'hh:mm a', new Date()));
      closeHour = getHours(parse(slot.to, 'hh:mm a', new Date()));
      closeMinutes = getMinutes(parse(slot.to, 'hh:mm a', new Date()));
    }

    return {
      day_of_week: slot.day,
      closed_all_day: closed,
      open_hour: openHour,
      open_minutes: openMinutes,
      close_hour: closeHour,
      close_minutes: closeMinutes,
      open_all_day: openAllDay,
    };
  });
};

// Validate time slot (from must be before to)
export const validateTimeSlot = (from: string, to: string): boolean => {
  if (!from || !to) return false;

  try {
    const fromDate = parse(from, 'hh:mm a', new Date());
    const toDate = parse(to, 'hh:mm a', new Date());

    // Special case for midnight (next day)
    if (to === '12:00 AM') return true;

    return differenceInMinutes(toDate, fromDate) > 0;
  } catch {
    return false;
  }
};

// Calculate total hours for a time slot
export const calculateTotalHours = (timeSlot: TimeSlot): number => {
  if (timeSlot.openAllDay) return 24;

  if (!timeSlot.from || !timeSlot.to || !timeSlot.valid) return 0;

  try {
    const fromDate = parse(timeSlot.from, 'hh:mm a', new Date());
    const toDate = parse(timeSlot.to, 'hh:mm a', new Date());

    // Handle midnight as next day
    if (timeSlot.to === '12:00 AM') {
      const nextDayMidnight = new Date(toDate);
      nextDayMidnight.setDate(nextDayMidnight.getDate() + 1);
      return differenceInMinutes(nextDayMidnight, fromDate) / 60;
    }

    return Math.max(0, differenceInMinutes(toDate, fromDate) / 60);
  } catch {
    return 0;
  }
};

// Timezone data (simplified for Brazil-focused app)
export const getTimeZoneOptions = (): TimeZone[] => [
  { label: i18n.t('channels:settings.businessHours.timezones.brasilia'), value: 'America/Sao_Paulo' },
  { label: i18n.t('channels:settings.businessHours.timezones.acre'), value: 'America/Rio_Branco' },
  { label: i18n.t('channels:settings.businessHours.timezones.manaus'), value: 'America/Manaus' },
  { label: i18n.t('channels:settings.businessHours.timezones.fernandoDeNoronha'), value: 'America/Noronha' },
  { label: i18n.t('channels:settings.businessHours.timezones.utc'), value: 'UTC' },
  { label: i18n.t('channels:settings.businessHours.timezones.easternTime'), value: 'America/New_York' },
  { label: i18n.t('channels:settings.businessHours.timezones.centralTime'), value: 'America/Chicago' },
  { label: i18n.t('channels:settings.businessHours.timezones.mountainTime'), value: 'America/Denver' },
  { label: i18n.t('channels:settings.businessHours.timezones.pacificTime'), value: 'America/Los_Angeles' },
  { label: i18n.t('channels:settings.businessHours.timezones.london'), value: 'Europe/London' },
  { label: i18n.t('channels:settings.businessHours.timezones.paris'), value: 'Europe/Paris' },
  { label: i18n.t('channels:settings.businessHours.timezones.tokyo'), value: 'Asia/Tokyo' },
];

export const getDefaultTimezone = (): TimeZone => ({
  label: i18n.t('channels:settings.businessHours.timezones.brasilia'),
  value: 'America/Sao_Paulo',
});
