import { useState, useCallback } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@evoapi/design-system';
import { Save, Trash2, Edit3 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface SchemaFieldProps {
  fieldKey: string;
  field: {
    type?: string;
    description?: string;
  };
  onUpdate: (key: string, field: { type?: string; description?: string }) => void;
  onRemove: (key: string) => void;
  isReadOnly?: boolean;
}

const SchemaField = ({ fieldKey, field, onUpdate, onRemove, isReadOnly }: SchemaFieldProps) => {
  const { t } = useLanguage('aiAgents');
  const [currentKey, setCurrentKey] = useState(fieldKey);
  const [currentType, setCurrentType] = useState(field.type || 'string');
  const [currentDescription, setCurrentDescription] = useState(field.description || '');
  const [isEditing, setIsEditing] = useState(false);

  const fieldTypes = [
    { value: 'string', label: t('outputSchema.types.string') },
    { value: 'number', label: t('outputSchema.types.number') },
    { value: 'boolean', label: t('outputSchema.types.boolean') },
    { value: 'array', label: t('outputSchema.types.array') },
    { value: 'object', label: t('outputSchema.types.object') },
  ];

  const handleSave = useCallback(() => {
    if (!currentKey.trim()) return;

    // Atualizar campo existente com novos valores
    onUpdate(currentKey, {
      type: currentType,
      description: currentDescription,
    });
    
    // Desabilitar edição após salvar
    setIsEditing(false);
  }, [currentKey, currentType, currentDescription, onUpdate]);

  return (
    <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
      {/* Campo Nome */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium min-w-0 flex-shrink-0">{t('outputSchema.fieldName')}:</Label>
        {isEditing ? (
          <Input
            value={currentKey}
            onChange={e => setCurrentKey(e.target.value)}
            placeholder={t('outputSchema.fieldNamePlaceholder')}
            className="text-sm font-mono"
            disabled={isReadOnly}
          />
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="font-mono text-sm bg-primary/10 px-2 py-1 rounded flex-1">{currentKey}</span>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Campo Tipo */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium min-w-[60px] flex-shrink-0">{t('outputSchema.fieldType')}:</Label>
        <Select
          value={currentType}
          onValueChange={setCurrentType}
          disabled={isReadOnly || !isEditing}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campo Descrição */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('outputSchema.description')}:</Label>
        <Textarea
          value={currentDescription}
          onChange={e => setCurrentDescription(e.target.value)}
          placeholder={t('outputSchema.descriptionPlaceholder')}
          className="text-sm resize-none"
          rows={2}
          disabled={isReadOnly || !isEditing}
        />
      </div>

      {/* Botões de Ação */}
      {!isReadOnly && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(fieldKey)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {t('actions.remove')}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Save className="h-3 w-3 mr-1" />
              {t('actions.save')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemaField;
