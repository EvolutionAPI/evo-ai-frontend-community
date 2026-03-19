import { useState, useCallback } from 'react';
import { Button } from '@evoapi/design-system';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import TaskConfigForm, { TaskConfigData } from '@/components/ai_agents/Forms/TaskConfigForm';

interface WizardStep3Props {
  data: TaskConfigData;
  onChange: (data: TaskConfigData) => void;
  onNext: () => void;
  onBack: () => void;
  editingAgentId?: string;
  folderId?: string;
}

const WizardStep3_TaskConfig = ({
  data,
  onChange,
  onNext,
  onBack,
  editingAgentId,
  folderId,
}: WizardStep3Props) => {
  const { t } = useLanguage('aiAgents');
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleValidationChange = useCallback((valid: boolean, validationErrors: string[]) => {
    setIsValid(valid);
    setErrors(validationErrors);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 max-w-5xl mx-auto py-2 px-4">
      <div className="flex-1 overflow-y-auto min-h-0">
        <TaskConfigForm
          mode="create"
          data={data}
          onChange={onChange}
          onValidationChange={handleValidationChange}
          editingAgentId={editingAgentId}
          folderId={folderId}
        />
      </div>

      <div className="flex justify-between flex-shrink-0 pt-2 border-t mt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('actions.back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="gap-2 px-6"
        >
          {t('actions.continue')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {errors.length > 0 && !isValid && (
        <div className="mt-2 text-sm text-red-600">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default WizardStep3_TaskConfig;
