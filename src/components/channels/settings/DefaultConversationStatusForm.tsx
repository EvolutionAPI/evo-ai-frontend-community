import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@evoapi/design-system';
import { useLanguage } from '@/hooks/useLanguage';
import { MessageCircle } from 'lucide-react';

interface DefaultStatusFormData {
  default_conversation_status?: string | null;
}

interface DefaultConversationStatusFormProps {
  formData: DefaultStatusFormData;
  onFormChange: (updates: Partial<DefaultStatusFormData>) => void;
}

const CONVERSATION_STATUS_OPTIONS = [
  { value: 'open', labelKey: 'settings.defaultConversationStatus.options.open' },
  { value: 'pending', labelKey: 'settings.defaultConversationStatus.options.pending' },
  { value: 'resolved', labelKey: 'settings.defaultConversationStatus.options.resolved' },
  { value: 'snoozed', labelKey: 'settings.defaultConversationStatus.options.snoozed' },
];

export default function DefaultConversationStatusForm({
  formData,
  onFormChange,
}: DefaultConversationStatusFormProps) {
  const { t } = useLanguage('channels');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/5 dark:bg-primary/10">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{t('settings.defaultConversationStatus.title')}</h4>
          <p className="text-sm text-muted-foreground">
            {t('settings.defaultConversationStatus.description')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-foreground">
            {t('settings.defaultConversationStatus.selectLabel')}
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            {t('settings.defaultConversationStatus.selectDescription')}
          </p>
        </div>
        <Select
          value={formData.default_conversation_status || undefined}
          onValueChange={(value) => onFormChange({ default_conversation_status: value || null })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('settings.defaultConversationStatus.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {CONVERSATION_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg">
        <div className="flex gap-2">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {t('settings.defaultConversationStatus.info.title')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('settings.defaultConversationStatus.info.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

