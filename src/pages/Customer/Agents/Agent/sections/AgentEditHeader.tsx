import { Button } from '@evoapi/design-system';
import { ArrowLeft, Save, Loader2, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AgentEditHeaderProps {
  onBack: () => void;
  onSave: () => void;
  onTestAgent?: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const AgentEditHeader = ({ onBack, onSave, onTestAgent, isDirty, isSaving }: AgentEditHeaderProps) => {
  const { t } = useLanguage('aiAgents');

  return (
    <div className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('actions.back') || 'Voltar'}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {onTestAgent && (
          <Button variant="outline" onClick={onTestAgent} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('actions.testAgent') || 'Teste seu agente'}
          </Button>
        )}
        <Button onClick={onSave} disabled={!isDirty || isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('messages.saving') || 'Salvando...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t('actions.save') || 'Salvar'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AgentEditHeader;

