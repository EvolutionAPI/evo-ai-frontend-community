import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@evoapi/design-system';

interface IntegrationBackButtonProps {
  onBack?: () => void;
}

export default function IntegrationBackButton({ onBack }: IntegrationBackButtonProps) {
  const { t } = useLanguage('integrations');

  if (!onBack) return null;

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('actions.backToIntegrations')}
      </Button>
    </div>
  );
}
