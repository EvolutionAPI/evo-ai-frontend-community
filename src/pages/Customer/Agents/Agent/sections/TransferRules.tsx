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
} from '@evoapi/design-system';
import { UserRound, Trash2, Plus, Info } from 'lucide-react';

export interface TransferRule {
  id: string;
  transferTo: 'human' | 'team';
  userId?: string;
  userName?: string;
  teamId?: string;
  teamName?: string;
  returnOnFinish: boolean;
  instructions: string;
}

interface TransferRulesProps {
  rules: TransferRule[];
  onChange: (rules: TransferRule[]) => void;
  availableUsers?: Array<{ id: string; name: string }>;
  availableTeams?: Array<{ id: string; name: string }>;
}

const TransferRules = ({ rules, onChange, availableUsers = [], availableTeams = [] }: TransferRulesProps) => {
  const { t } = useLanguage('aiAgents');

  const handleAddRule = () => {
    const newRule: TransferRule = {
      id: `rule_${Date.now()}`,
      transferTo: 'human',
      returnOnFinish: false,
      instructions: '',
    };
    onChange([...rules, newRule]);
  };

  const handleUpdateRule = (id: string, updates: Partial<TransferRule>) => {
    onChange(
      rules.map(rule => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const handleRemoveRule = (id: string) => {
    onChange(rules.filter(rule => rule.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {t('edit.configuration.transferRules.description') ||
            'Configure instruções para o agente fazer transferência do atendimento.'}
        </p>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id} className="bg-card">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Transfer To */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">
                      {t('edit.configuration.transferRules.transferTo') || 'Transferir para:'}
                    </label>
                    <Select
                      value={rule.transferTo}
                      onValueChange={value =>
                        handleUpdateRule(rule.id, { transferTo: value as 'human' | 'team' })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="human">
                          {t('edit.configuration.transferRules.aHuman') || 'Humano'}
                        </SelectItem>
                        <SelectItem value="team">
                          {t('edit.configuration.transferRules.aTeam') || 'Time'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* User Selection (if transferTo is human) */}
                  {rule.transferTo === 'human' && (
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">
                        {t('edit.configuration.transferRules.selectUser') || 'Selecione o usuário:'}
                      </label>
                      <Select
                        value={rule.userId || ''}
                        onValueChange={value => {
                          const user = availableUsers.find(u => u.id === value);
                          handleUpdateRule(rule.id, {
                            userId: value,
                            userName: user?.name,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('edit.configuration.transferRules.selectUserPlaceholder') || 'Selecione um usuário'} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <UserRound className="h-3 w-3 text-primary" />
                                </div>
                                <span>{user.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Team Selection (if transferTo is team) */}
                  {rule.transferTo === 'team' && (
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">
                        {t('edit.configuration.transferRules.selectTeam') || 'Selecione o time:'}
                      </label>
                      <Select
                        value={rule.teamId || ''}
                        onValueChange={value => {
                          const team = availableTeams.find(t => t.id === value);
                          handleUpdateRule(rule.id, {
                            teamId: value,
                            teamName: team?.name,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('edit.configuration.transferRules.selectTeamPlaceholder') || 'Selecione um time'} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeams.map(team => (
                            <SelectItem key={team.id} value={team.id}>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <UserRound className="h-3 w-3 text-primary" />
                                </div>
                                <span>{team.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Return on Finish */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`return-${rule.id}`}
                    checked={rule.returnOnFinish}
                    onCheckedChange={checked =>
                      handleUpdateRule(rule.id, { returnOnFinish: !!checked })
                    }
                  />
                  <label
                    htmlFor={`return-${rule.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t('edit.configuration.transferRules.returnOnFinish') || 'Devolver ao finalizar'}
                  </label>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {t('edit.configuration.transferRules.instructions') || 'Instruções:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(rule.instructions?.length || 0)}/255
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={rule.instructions || ''}
                    onChange={e =>
                      handleUpdateRule(rule.id, { instructions: e.target.value })
                    }
                    placeholder={t('edit.configuration.transferRules.instructionsPlaceholder') || 'Quando o cliente quiser falar sobre tal assunto...'}
                    maxLength={255}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Rule Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddRule}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t('edit.configuration.transferRules.addRule') || 'Adicionar regra de transferência'}
      </Button>
    </div>
  );
};

export default TransferRules;

