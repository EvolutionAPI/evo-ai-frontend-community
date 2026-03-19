import { useLanguage } from '@/hooks/useLanguage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Button,
  Card,
  CardContent,
  Checkbox,
  Label,
} from '@evoapi/design-system';
import { GitBranch, Trash2, Plus, Info, CheckSquare, Briefcase } from 'lucide-react';

export interface StageRule {
  id: string;
  stageId: string;
  stageName?: string;
  instructions: string;
}

export interface PipelineRule {
  id: string;
  pipelineId: string;
  pipelineName?: string;
  allowTasks: boolean;
  allowServices: boolean;
  generalInstructions: string;
  stages: StageRule[];
}

interface PipelineRulesProps {
  rules: PipelineRule[];
  onChange: (rules: PipelineRule[]) => void;
  availablePipelines?: Array<{
    id: string;
    name: string;
    stages: Array<{ id: string; name: string }>;
  }>;
}

const PipelineRules = ({ rules = [], onChange, availablePipelines = [] }: PipelineRulesProps) => {
  const { t } = useLanguage('aiAgents');

  const safeRules = rules || [];

  const handleAddPipeline = () => {
    const newRule: PipelineRule = {
      id: `pipeline_${Date.now()}`,
      pipelineId: '',
      pipelineName: '',
      allowTasks: false,
      allowServices: false,
      generalInstructions: '',
      stages: [],
    };
    onChange([...safeRules, newRule]);
  };

  const handleUpdatePipeline = (id: string, updates: Partial<PipelineRule>) => {
    onChange(
      safeRules.map(rule => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const handleRemovePipeline = (id: string) => {
    onChange(safeRules.filter(rule => rule.id !== id));
  };

  const handleAddStage = (pipelineRuleId: string) => {
    const pipelineRule = safeRules.find(r => r.id === pipelineRuleId);
    if (!pipelineRule) return;

    const newStage: StageRule = {
      id: `stage_${Date.now()}`,
      stageId: '',
      stageName: '',
      instructions: '',
    };

    handleUpdatePipeline(pipelineRuleId, {
      stages: [...pipelineRule.stages, newStage],
    });
  };

  const handleUpdateStage = (pipelineRuleId: string, stageId: string, updates: Partial<StageRule>) => {
    const pipelineRule = safeRules.find(r => r.id === pipelineRuleId);
    if (!pipelineRule) return;

    const updatedStages = pipelineRule.stages.map(stage =>
      stage.id === stageId ? { ...stage, ...updates } : stage
    );

    handleUpdatePipeline(pipelineRuleId, { stages: updatedStages });
  };

  const handleRemoveStage = (pipelineRuleId: string, stageId: string) => {
    const pipelineRule = safeRules.find(r => r.id === pipelineRuleId);
    if (!pipelineRule) return;

    const updatedStages = pipelineRule.stages.filter(stage => stage.id !== stageId);
    handleUpdatePipeline(pipelineRuleId, { stages: updatedStages });
  };

  const getSelectedPipeline = (pipelineId: string) => {
    return availablePipelines.find(p => p.id === pipelineId);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {t('edit.configuration.pipelineRules.description') ||
            'Configure instruções para o agente manipular pipelines e atribuir conversas a estágios específicos.'}
        </p>
      </div>

      {/* Pipeline Rules List */}
      <div className="space-y-6">
        {safeRules.map(rule => {
          const selectedPipeline = getSelectedPipeline(rule.pipelineId);

          return (
            <Card key={rule.id} className="bg-card border-2">
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Pipeline Selection Header */}
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <Select
                        value={rule.pipelineId || ''}
                        onValueChange={value => {
                          const pipeline = availablePipelines.find(p => p.id === value);
                          handleUpdatePipeline(rule.id, {
                            pipelineId: value,
                            pipelineName: pipeline?.name,
                            stages: [], // Reset stages when pipeline changes
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              t('edit.configuration.pipelineRules.selectPipeline') ||
                              'Selecione o pipeline'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePipelines.map(pipeline => (
                            <SelectItem key={pipeline.id} value={pipeline.id}>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <GitBranch className="h-3 w-3 text-primary" />
                                </div>
                                <span className="font-medium">{pipeline.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePipeline(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Configurações de Permissões e Instruções Gerais */}
                  {rule.pipelineId && selectedPipeline && (
                    <div className="space-y-4 mt-4 p-4 bg-muted/20 rounded-lg border border-dashed">
                      {/* Checkboxes de permissões */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`allow-tasks-${rule.id}`}
                            checked={rule.allowTasks || false}
                            onCheckedChange={(checked) =>
                              handleUpdatePipeline(rule.id, { allowTasks: !!checked })
                            }
                          />
                          <Label
                            htmlFor={`allow-tasks-${rule.id}`}
                            className="flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <CheckSquare className="h-4 w-4 text-blue-500" />
                            {t('edit.configuration.pipelineRules.allowTasks') ||
                              'Criar/gerenciar tarefas'}
                          </Label>
                        </div>

                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`allow-services-${rule.id}`}
                            checked={rule.allowServices || false}
                            onCheckedChange={(checked) =>
                              handleUpdatePipeline(rule.id, { allowServices: !!checked })
                            }
                          />
                          <Label
                            htmlFor={`allow-services-${rule.id}`}
                            className="flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Briefcase className="h-4 w-4 text-green-500" />
                            {t('edit.configuration.pipelineRules.allowServices') ||
                              'Criar/gerenciar serviços'}
                          </Label>
                        </div>
                      </div>

                      {/* Campo de instruções gerais */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            {t('edit.configuration.pipelineRules.generalInstructions') ||
                              'Instruções gerais (quando e o que fazer):'}
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {(rule.generalInstructions?.length || 0)}/500
                          </span>
                        </div>
                        <Textarea
                          value={rule.generalInstructions || ''}
                          onChange={(e) =>
                            handleUpdatePipeline(rule.id, {
                              generalInstructions: e.target.value,
                            })
                          }
                          placeholder={
                            t('edit.configuration.pipelineRules.generalInstructionsPlaceholder') ||
                            'Defina quando o agente deve criar tarefas, adicionar serviços, ou realizar outras ações neste pipeline...'
                          }
                          maxLength={500}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Stages List (only if pipeline is selected) */}
                  {rule.pipelineId && selectedPipeline && (
                    <div className="space-y-3 pl-8">
                      {rule.stages.map(stage => (
                        <div
                          key={stage.id}
                          className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed"
                        >
                          {/* Stage Selection */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Select
                                value={stage.stageId || ''}
                                onValueChange={value => {
                                  const stageData = selectedPipeline.stages.find(
                                    s => s.id === value
                                  );
                                  handleUpdateStage(rule.id, stage.id, {
                                    stageId: value,
                                    stageName: stageData?.name,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue
                                    placeholder={
                                      t('edit.configuration.pipelineRules.selectStage') ||
                                      'Selecione o estágio'
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedPipeline.stages.map(stageOption => (
                                    <SelectItem key={stageOption.id} value={stageOption.id}>
                                      {stageOption.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStage(rule.id, stage.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          {/* Stage Instructions */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">
                                {t('edit.configuration.pipelineRules.instructions') ||
                                  'Regras de atribuição:'}
                              </label>
                              <span className="text-xs text-muted-foreground">
                                {(stage.instructions?.length || 0)}/255
                              </span>
                            </div>
                            <Textarea
                              value={stage.instructions || ''}
                              onChange={e =>
                                handleUpdateStage(rule.id, stage.id, {
                                  instructions: e.target.value,
                                })
                              }
                              placeholder={
                                t('edit.configuration.pipelineRules.instructionsPlaceholder') ||
                                'Quando o cliente mencionar interesse em produto X, mova para este estágio...'
                              }
                              maxLength={255}
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Add Stage Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddStage(rule.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('edit.configuration.pipelineRules.addStage') ||
                          'Adicionar estágio'}
                      </Button>
                    </div>
                  )}

                  {/* No Pipeline Selected Message */}
                  {!rule.pipelineId && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t('edit.configuration.pipelineRules.selectPipelineFirst') ||
                        'Selecione um pipeline para adicionar estágios'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Pipeline Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddPipeline}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t('edit.configuration.pipelineRules.addPipeline') || 'Adicionar pipeline'}
      </Button>
    </div>
  );
};

export default PipelineRules;
