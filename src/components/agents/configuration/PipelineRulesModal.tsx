import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@evoapi/design-system';
import PipelineRules, { PipelineRule } from '@/pages/Customer/Agents/Agent/sections/PipelineRules';

interface PipelineRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: PipelineRule[];
  onChange: (rules: PipelineRule[]) => void;
  availablePipelines?: Array<{
    id: string;
    name: string;
    stages: Array<{ id: string; name: string }>;
  }>;
}

export const PipelineRulesModal = ({
  open,
  onOpenChange,
  rules,
  onChange,
  availablePipelines,
}: PipelineRulesModalProps) => {
  const { t } = useLanguage('aiAgents');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('edit.configuration.pipelineRules.modalTitle') || 'Regras de Pipeline'}
          </DialogTitle>
          <DialogDescription>
            {t('edit.configuration.pipelineRules.modalDescription') ||
              'Configure quando e como o agente deve mover conversas entre pipelines e estágios.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PipelineRules
            rules={rules}
            onChange={onChange}
            availablePipelines={availablePipelines}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
