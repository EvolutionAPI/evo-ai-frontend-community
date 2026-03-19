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
} from '@evoapi/design-system';
import { Clock, Trash2, Plus, Info } from 'lucide-react';

export interface InactivityAction {
  id: string;
  minutes: number;
  action: 'interact' | 'finalize';
  message?: string;
}

interface InactivityActionsProps {
  actions: InactivityAction[];
  onChange: (actions: InactivityAction[]) => void;
}

const InactivityActions = ({ actions, onChange }: InactivityActionsProps) => {
  const { t } = useLanguage('aiAgents');

  const handleAddAction = () => {
    const newAction: InactivityAction = {
      id: `action_${Date.now()}`,
      minutes: 2,
      action: 'interact',
      message: '',
    };
    onChange([...actions, newAction]);
  };

  const handleUpdateAction = (id: string, updates: Partial<InactivityAction>) => {
    onChange(actions.map(action => (action.id === id ? { ...action, ...updates } : action)));
  };

  const handleRemoveAction = (id: string) => {
    onChange(actions.filter(action => action.id !== id));
  };

  const minuteOptions = [2, 5, 10, 15, 30, 60];

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {t('edit.configuration.inactivityActions.description') ||
            'Configure ações que o agente deve executar quando o cliente parar de responder.'}
        </p>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.map((action) => (
          <Card key={action.id} className="bg-card">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {t('edit.configuration.inactivityActions.ifNotRespondIn') ||
                          'Se não responder em'}
                      </span>
                      <Select
                        value={action.minutes.toString()}
                        onValueChange={value =>
                          handleUpdateAction(action.id, { minutes: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {minuteOptions.map(min => (
                            <SelectItem key={min} value={min.toString()}>
                              {min}{' '}
                              {t('edit.configuration.inactivityActions.minutes') || 'minutos'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        {t('edit.configuration.inactivityActions.theAgentShould') ||
                          'o agente deve'}
                      </span>
                      <Select
                        value={action.action}
                        onValueChange={value =>
                          handleUpdateAction(action.id, {
                            action: value as 'interact' | 'finalize',
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interact">
                            {t('edit.configuration.inactivityActions.interactWithClient') ||
                              'Interagir com cliente'}
                          </SelectItem>
                          <SelectItem value="finalize">
                            {t('edit.configuration.inactivityActions.finalizeService') ||
                              'Finalizar atendimento'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(action.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Message Input (only for interact action) */}
                {action.action === 'interact' && (
                  <div className="space-y-2 pl-8">
                    <label className="text-sm font-medium">
                      {t('edit.configuration.inactivityActions.whatShouldAgentSay') ||
                        'O que o agente deve falar?'}
                    </label>
                    <Textarea
                      value={action.message || ''}
                      onChange={e => handleUpdateAction(action.id, { message: e.target.value })}
                      placeholder={
                        t('edit.configuration.inactivityActions.messagePlaceholder') ||
                        'Perguntar se o cliente ainda está interessado'
                      }
                      maxLength={512}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">
                        {action.message?.length || 0}/512
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Action Button */}
      <Button type="button" variant="outline" onClick={handleAddAction} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {t('edit.configuration.inactivityActions.addAction') || '+ Adicionar ação anterior'}
      </Button>
    </div>
  );
};

export default InactivityActions;
