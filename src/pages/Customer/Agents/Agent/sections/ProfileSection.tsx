import { useState } from 'react';
import { Button, Input, Label, Textarea } from '@evoapi/design-system';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { openaiService } from '@/services/integrations/openaiService';
import { useGlobalConfig } from '@/contexts/GlobalConfigContext';
import { toast } from 'sonner';
import PromptGeneratorModal from '@/components/agents/wizard/PromptGeneratorModal';

interface ProfileSectionProps {
  formData: {
    name: string;
    description: string;
    role: string;
    goal: string;
    instruction: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  agentType?: string;
}

const ProfileSection = ({ formData, onFormDataChange, agentType }: ProfileSectionProps) => {
  const { t } = useLanguage('aiAgents');
  const config = useGlobalConfig();
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Orchestrator types and external don't have role, goal, or instruction
  const isOrchestratorType = ['sequential', 'parallel', 'loop', 'task', 'external'].includes(agentType || '');

  // Check if OpenAI is configured to show AI actions
  const showAIActions = config.openaiConfigured === true;

  const handleReview = async () => {
    if (!formData.instruction || !formData.instruction.trim()) {
      toast.error(t('wizard.promptGenerator.messages.fillPromptToReview'));
      return;
    }

    setIsReviewing(true);
    try {
      const reviewedPrompt = await openaiService.processEvent({
        type: 'review_prompt',
        content: formData.instruction,
      });

      if (reviewedPrompt) {
        onFormDataChange('instruction', reviewedPrompt);
        toast.success(t('wizard.promptGenerator.messages.reviewSuccess'));
      }
    } catch (error) {
      console.error('Error reviewing prompt:', error);
      const errorMessage =
        error instanceof Error ? error.message : t('wizard.promptGenerator.messages.reviewError');
      toast.error(errorMessage);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {t('edit.profile.title') || 'Informações pessoais'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('edit.profile.subtitle') || 'Configure as informações básicas do seu agente'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Nome do agente */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {t('edit.profile.name') || 'Nome do agente'} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={e => onFormDataChange('name', e.target.value)}
              placeholder={t('edit.profile.namePlaceholder') || 'Digite o nome do agente'}
              className="max-w-md"
            />
          </div>

          {/* Papel - Only for non-orchestrator types */}
          {!isOrchestratorType && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t('edit.profile.role') || 'Papel'}</Label>
              <Input
                value={formData.role}
                onChange={e => onFormDataChange('role', e.target.value)}
                placeholder={
                  t('edit.profile.rolePlaceholder') || 'Ex: Especialista em suporte técnico'
                }
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">
                {t('edit.profile.roleHelp') || 'O papel que o agente desempenha na conversa'}
              </p>
            </div>
          )}

          {/* Objetivo - Only for non-orchestrator types */}
          {!isOrchestratorType && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                {t('edit.profile.goal') || 'Objetivo'}
              </Label>
              <Input
                value={formData.goal}
                onChange={e => onFormDataChange('goal', e.target.value)}
                placeholder={
                  t('edit.profile.goalPlaceholder') || 'Ex: Ajudar usuários com dúvidas técnicas'
                }
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">
                {t('edit.profile.goalHelp') || 'O objetivo principal do agente'}
              </p>
            </div>
          )}

          {/* Instruções - Only for non-orchestrator types */}
          {!isOrchestratorType && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  {t('edit.profile.instructions') || 'Comportamento'}
                </Label>
                {showAIActions && (
                  <div className="flex gap-2">
                    {formData.instruction && formData.instruction.trim() && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleReview}
                        disabled={isReviewing}
                        className="gap-2"
                      >
                        {isReviewing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('wizard.promptGenerator.buttons.reviewing')}
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 text-blue-500" />
                            {t('wizard.promptGenerator.buttons.review')}
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPromptModal(true)}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      {t('wizard.step5.generateWithAI')}
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={formData.instruction}
                onChange={e => onFormDataChange('instruction', e.target.value)}
                placeholder={
                  t('edit.profile.instructionsPlaceholder') ||
                  'Descreva como o agente deve se comportar durante a conversa...'
                }
                className="min-h-[200px]"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {t('edit.profile.instructionsHelp') ||
                    'Ex. Seja extrovertido, na primeira interação procure saber o nome do usuário.'}
                </span>
                <span>{formData.instruction.length}/3000</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Generator Modal */}
      <PromptGeneratorModal
        open={showPromptModal}
        onOpenChange={setShowPromptModal}
        onGenerated={prompt => {
          onFormDataChange('instruction', prompt);
        }}
        initialPrompt={formData.instruction}
      />
    </>
  );
};

export default ProfileSection;
