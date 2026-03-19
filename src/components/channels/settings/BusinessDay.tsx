import { useMemo } from 'react';
import { Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@evoapi/design-system';
import { Minus } from 'lucide-react';
import { TimeSlot, generateTimeSlots, validateTimeSlot, calculateTotalHours } from './helpers/businessHours';
import { useLanguage } from '@/hooks/useLanguage';

interface BusinessDayProps {
  dayName: string;
  timeSlot: TimeSlot;
  onUpdate: (timeSlot: TimeSlot) => void;
}

export default function BusinessDay({ dayName, timeSlot, onUpdate }: BusinessDayProps) {
  const { t } = useLanguage('channels');
  // Generate time slots
  const fromTimeSlots = useMemo(() => generateTimeSlots(30), []);
  const toTimeSlots = useMemo(() => fromTimeSlots.filter(slot => slot !== '12:00 AM'), [fromTimeSlots]);

  const isDayEnabled = Boolean(timeSlot.from && timeSlot.to);
  const hasError = !timeSlot.valid && isDayEnabled;
  const totalHours = calculateTotalHours(timeSlot);

  const handleDayToggle = (checked: boolean) => {
    if (checked) {
      // Enable day with default hours (9 AM to 5 PM)
      onUpdate({
        ...timeSlot,
        from: '09:00 AM',
        to: '05:00 PM',
        valid: true,
        openAllDay: false,
      });
    } else {
      // Disable day
      onUpdate({
        ...timeSlot,
        from: '',
        to: '',
        valid: false,
        openAllDay: false,
      });
    }
  };

  const handleOpenAllDayToggle = (checked: boolean) => {
    if (checked) {
      // Set to 24 hours
      onUpdate({
        ...timeSlot,
        from: '12:00 AM',
        to: '11:59 PM',
        valid: true,
        openAllDay: true,
      });
    } else {
      // Set to default business hours
      onUpdate({
        ...timeSlot,
        from: '09:00 AM',
        to: '05:00 PM',
        valid: true,
        openAllDay: false,
      });
    }
  };

  const handleFromTimeChange = (value: string) => {
    const valid = validateTimeSlot(value, timeSlot.to);
    onUpdate({
      ...timeSlot,
      from: value,
      valid,
    });
  };

  const handleToTimeChange = (value: string) => {
    const valid = validateTimeSlot(timeSlot.from, value);
    onUpdate({
      ...timeSlot,
      to: value,
      valid,
    });
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border min-h-[3rem]">
      {/* Day Enable Checkbox */}
      <div className="flex items-center">
        <Checkbox
          checked={isDayEnabled}
          onCheckedChange={handleDayToggle}
          aria-label={t('settings.businessDay.enableDay', { day: dayName })}
        />
      </div>

      {/* Day Name */}
      <div className="flex items-center py-0 px-3 text-sm font-medium flex-shrink-0 min-w-28">
        <span>{dayName}</span>
      </div>

      {/* Time Configuration */}
      {isDayEnabled ? (
        <div className="flex flex-col flex-1">
          {/* Time Controls */}
          <div className="flex items-center gap-4">
            {/* Open All Day Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={timeSlot.openAllDay || false}
                onCheckedChange={handleOpenAllDayToggle}
                aria-label={t('settings.businessDay.open24Hours')}
              />
              <span className="text-sm font-medium whitespace-nowrap">{t('settings.businessDay.twentyFourHours')}</span>
            </div>

            {/* From Time */}
            <Select value={timeSlot.from} onValueChange={handleFromTimeChange} disabled={timeSlot.openAllDay}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('settings.businessDay.startPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {fromTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Separator */}
            <div className="flex items-center px-2">
              <Minus className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* To Time */}
            <Select value={timeSlot.to} onValueChange={handleToTimeChange} disabled={timeSlot.openAllDay}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('settings.businessDay.endPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {toTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {hasError && (
            <div className="pt-2">
              <span className="text-xs text-red-500">
                {t('settings.businessDay.timeError')}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Disabled State */
        <div className="flex items-center flex-1 text-sm text-muted-foreground">
          <span>{t('settings.businessDay.unavailable')}</span>
        </div>
      )}

      {/* Hours Badge */}
      <div className="flex-shrink-0">
        {isDayEnabled && !hasError && (
          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg whitespace-nowrap">
            {totalHours}h
          </span>
        )}
      </div>
    </div>
  );
}
