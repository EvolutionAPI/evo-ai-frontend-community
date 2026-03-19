import { useState, useEffect } from 'react';
import { Input, Label, Button, Textarea } from '@evoapi/design-system';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Step1Props {
  data: { name: string; description: string };
  onChange: (data: { name: string; description: string }) => void;
  onNext: () => void;
}

const Step1_Name = ({ data, onChange, onNext }: Step1Props) => {
  const { t } = useLanguage('aiAgents');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (data.name && data.name.trim().length < 3) {
      setError(t('validation.minLength', { min: 3 }));
    } else {
      setError('');
    }
  }, [data.name, t]);

  const handleNext = () => {
    if (!data.name || !data.name.trim()) {
      setError(t('validation.nameRequired'));
      return;
    }
    if (data.name.trim().length < 3) {
      setError(t('validation.minLength', { min: 3 }));
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto py-2 px-4">
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-3">
          <div>
            <Label className="text-sm mb-1.5 block font-semibold">
              {t('wizard.step1.nameLabel')} <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder={t('wizard.step1.namePlaceholder')}
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className={`h-10 text-sm ${error ? 'border-red-500 focus:border-red-500' : ''}`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !error && data.name) {
                  handleNext();
                }
              }}
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
          <div>
            <Label className="text-sm mb-1.5 block font-semibold">{t('wizard.step1.descriptionLabel')}</Label>
            <Textarea
              placeholder={t('wizard.step1.descriptionPlaceholder')}
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              className="min-h-[100px] text-sm resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>{t('wizard.step1.descriptionHelp')}</span>
              <span>{data.description.length}/500</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end flex-shrink-0 pt-2 border-t">
        <Button
          className="px-6 gap-2"
          onClick={handleNext}
          disabled={!data.name || !!error}
        >
          {t('actions.continue')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Step1_Name;
