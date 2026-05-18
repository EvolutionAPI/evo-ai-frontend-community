import { useState } from 'react';
import { Button, Input, Label, Switch, Textarea } from '@evoapi/design-system';
import { toast } from 'sonner';
import { journeyService } from '@/services';
import { TriggerType } from '@/types/automation';

interface Props {
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

/**
 * Versão inline do JourneyModal — mesmos campos (name, description, isActive),
 * mas sem o Dialog wrapper para encaixar dentro do CreateWithAIDialog sem
 * duplicar overlays.
 */
export function JourneyManualForm({ onSubmitSuccess, onCancel }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Informe o nome da jornada');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
        flowData: {
          nodes: [
            {
              id: 'journey-trigger-node',
              type: 'journey-trigger-node',
              position: { x: -100, y: 100 },
              data: {
                label: 'Gatilho da jornada',
                description: 'Define o evento de início',
                triggerType: 'manual',
                conditions: [],
              },
            },
          ],
          edges: [],
          variables: [],
        },
        flowTriggers: [
          {
            id: 'default-trigger',
            type: TriggerType.Manual,
            name: 'Manual',
            enabled: true,
          },
        ],
      };

      await journeyService.createJourney(payload);
      toast.success('Jornada criada');
      onSubmitSuccess();
    } catch (error) {
      console.error('Erro ao criar jornada:', error);
      toast.error('Não foi possível criar a jornada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">Criar manualmente</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Defina o cabeçalho — você desenha o fluxo no canvas depois.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="journey-name">Nome *</Label>
        <Input
          id="journey-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Onboarding em 7 dias"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="journey-description">Descrição</Label>
        <Textarea
          id="journey-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Para que serve essa jornada..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="journey-active"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={loading}
        />
        <Label htmlFor="journey-active">Ativa</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? 'Criando...' : 'Criar jornada'}
        </Button>
      </div>
    </div>
  );
}
