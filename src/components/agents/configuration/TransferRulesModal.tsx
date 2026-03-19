import { useLanguage } from '@/hooks/useLanguage';
import TransferRules, { TransferRule } from '@/pages/Customer/Agents/Agent/sections/TransferRules';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@evoapi/design-system';

interface TransferRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: TransferRule[];
  onChange: (rules: TransferRule[]) => void;
  availableUsers?: Array<{ id: string; name: string }>;
  availableTeams?: Array<{ id: string; name: string }>;
}

export const TransferRulesModal = ({
  open,
  onOpenChange,
  rules,
  onChange,
  availableUsers,
  availableTeams,
}: TransferRulesModalProps) => {
  const { t } = useLanguage('aiAgents');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('edit.configuration.transferRules.modalTitle') || 'Regras de Transferência'}
          </DialogTitle>
          <DialogDescription>
            {t('edit.configuration.transferRules.modalDescription') ||
              'Configure quando e como o agente deve transferir conversas para humanos ou times.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <TransferRules
            rules={rules}
            onChange={onChange}
            availableUsers={availableUsers}
            availableTeams={availableTeams}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
