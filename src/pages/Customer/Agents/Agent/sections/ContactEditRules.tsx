import { useLanguage } from '@/hooks/useLanguage';
import {
  Switch,
  Textarea,
  Card,
  CardContent,
  Checkbox,
  Label,
} from '@evoapi/design-system';
import { Info } from 'lucide-react';

export interface ContactEditConfig {
  enabled: boolean;
  editableFields: string[];
  instructions: string;
}

interface ContactEditRulesProps {
  config: ContactEditConfig;
  onChange: (config: ContactEditConfig) => void;
}

// Campos disponíveis para edição
const CONTACT_FIELDS = [
  { id: 'name', label: 'Nome', category: 'basic' },
  { id: 'email', label: 'Email', category: 'basic' },
  { id: 'phone_number', label: 'Telefone', category: 'basic' },
  { id: 'location', label: 'Localização', category: 'basic' },
  { id: 'country_code', label: 'País', category: 'basic' },
  { id: 'website', label: 'Website', category: 'basic' },
  { id: 'industry', label: 'Indústria', category: 'basic' },
  { id: 'tax_id', label: 'CPF/CNPJ', category: 'basic' },
  { id: 'company_name', label: 'Nome da Empresa', category: 'additional' },
  { id: 'city', label: 'Cidade', category: 'additional' },
  { id: 'description', label: 'Descrição', category: 'additional' },
  { id: 'social_profiles', label: 'Redes Sociais', category: 'additional' },
];

const ContactEditRules = ({ config, onChange }: ContactEditRulesProps) => {
  const { t } = useLanguage('aiAgents');

  const handleToggle = (checked: boolean) => {
    onChange({
      ...config,
      enabled: checked,
    });
  };

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    const newFields = checked
      ? [...config.editableFields, fieldId]
      : config.editableFields.filter(f => f !== fieldId);

    onChange({
      ...config,
      editableFields: newFields,
    });
  };

  const handleSelectAll = () => {
    onChange({
      ...config,
      editableFields: CONTACT_FIELDS.map(f => f.id),
    });
  };

  const handleDeselectAll = () => {
    onChange({
      ...config,
      editableFields: [],
    });
  };

  const handleInstructionsChange = (instructions: string) => {
    onChange({
      ...config,
      instructions,
    });
  };

  const basicFields = CONTACT_FIELDS.filter(f => f.category === 'basic');
  const additionalFields = CONTACT_FIELDS.filter(f => f.category === 'additional');

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {t('edit.configuration.contactEditRules.description') ||
              'Permite que o agente edite informações do contato durante a conversa. Configure quais campos podem ser alterados e quando isso deve acontecer.'}
          </p>
        </div>
      </div>

      {/* Enable/Disable */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                {t('edit.configuration.contactEditRules.enableEditing') || 'Permitir edição de contatos'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('edit.configuration.contactEditRules.enableEditingDescription') ||
                  'Habilita o agente a modificar informações de contato'}
              </p>
            </div>
            <Switch checked={config.enabled} onCheckedChange={handleToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Fields Selection */}
      {config.enabled && (
        <>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {t('edit.configuration.contactEditRules.editableFields') || 'Campos editáveis'}
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-primary hover:underline"
                  >
                    {t('edit.configuration.contactEditRules.selectAll') || 'Selecionar todos'}
                  </button>
                  <span className="text-xs text-muted-foreground">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs text-primary hover:underline"
                  >
                    {t('edit.configuration.contactEditRules.deselectAll') || 'Desmarcar todos'}
                  </button>
                </div>
              </div>

              {/* Campos Básicos */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('edit.configuration.contactEditRules.basicFields') || 'Campos Básicos'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {basicFields.map(field => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`field-${field.id}`}
                        checked={config.editableFields.includes(field.id)}
                        onCheckedChange={checked => handleFieldToggle(field.id, !!checked)}
                      />
                      <label
                        htmlFor={`field-${field.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campos Adicionais */}
              <div className="space-y-3 pt-3 border-t">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('edit.configuration.contactEditRules.additionalFields') || 'Campos Adicionais'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {additionalFields.map(field => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`field-${field.id}`}
                        checked={config.editableFields.includes(field.id)}
                        onCheckedChange={checked => handleFieldToggle(field.id, !!checked)}
                      />
                      <label
                        htmlFor={`field-${field.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                {config.editableFields.length}{' '}
                {t('edit.configuration.contactEditRules.fieldsSelected') || 'campos selecionados'}
              </p>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label className="text-base font-medium">
                {t('edit.configuration.contactEditRules.instructions') || 'Instruções'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('edit.configuration.contactEditRules.instructionsDescription') ||
                  'Defina quando e como o agente deve editar as informações do contato'}
              </p>
              <Textarea
                value={config.instructions || ''}
                onChange={e => handleInstructionsChange(e.target.value)}
                placeholder={
                  t('edit.configuration.contactEditRules.instructionsPlaceholder') ||
                  'Ex: Atualize o nome do contato quando ele se apresentar. Adicione o email quando o cliente fornecer. Atualize a cidade quando o cliente mencionar sua localização...'
                }
                maxLength={500}
                className="min-h-[120px]"
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {t('edit.configuration.contactEditRules.tip') || 'Dica:'}{' '}
                  {t('edit.configuration.contactEditRules.tipContent') ||
                    'Seja específico sobre quando cada campo deve ser editado'}
                </span>
                <span>{(config.instructions?.length || 0)}/500</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ContactEditRules;
