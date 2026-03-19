import { Button } from '@evoapi/design-system';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import SubAgentsForm from '@/components/ai_agents/Forms/SubAgentsForm';
import { SubAgentsData } from '@/components/ai_agents/Forms/SubAgentsForm';
import { useLanguage } from '@/hooks/useLanguage';

interface WizardStep3Props {
  data: SubAgentsData;
  onChange: (data: SubAgentsData) => void;
  onNext: () => void;
  onBack: () => void;
  agentType: string;
}

const WizardStep3_SubAgents = ({
  data,
  onChange,
  onNext,
  onBack,
}: WizardStep3Props) => {
  const { t } = useLanguage('aiAgents');

  return (
    <div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto py-2">
      <div className="flex-1 overflow-y-auto px-3 min-h-0 mb-2">
        <SubAgentsForm
          mode="create"
          data={data}
          onChange={onChange}
          onValidationChange={() => {}}
          editingAgentId={undefined}
          folderId={undefined}
        />
      </div>

      <div className="flex-shrink-0 flex justify-between pt-2 border-t px-3 pb-2 bg-background">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('actions.back')}
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onNext} className="gap-2">
            {t('actions.skip')}
          </Button>
          <Button onClick={onNext} className="gap-2 px-6">
            {t('actions.continue')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WizardStep3_SubAgents;
