import { useCallback } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
} from '@evoapi/design-system';
import {
  FileText,
  Plus,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import SchemaField from './SchemaField';

import CollapsibleHeader from './CollapsibleHeader';

interface OutputSchemaSectionProps {
  outputSchema: Record<
    string,
    {
      type?: string;
      description?: string;
    }
  >;
  isOpen: boolean;
  onToggle: () => void;
  onOutputSchemaChange: (schema: OutputSchemaSectionProps['outputSchema']) => void;
  isReadOnly?: boolean;
}

const OutputSchemaSection = ({
  outputSchema,
  isOpen,
  onToggle,
  onOutputSchemaChange,
  isReadOnly = false,
}: OutputSchemaSectionProps) => {
  const { t } = useLanguage('aiAgents');
  const handleSchemaFieldUpdate = useCallback(
    (originalKey: string, newKey: string, field: { type?: string; description?: string }) => {
      const newSchema = { ...outputSchema };
      
      // Se a chave mudou, remover a antiga
      if (originalKey !== newKey) {
        delete newSchema[originalKey];
      }
      
      // Adicionar/atualizar com a nova chave
      newSchema[newKey] = field;
      
      onOutputSchemaChange(newSchema);
    },
    [outputSchema, onOutputSchemaChange],
  );

  const handleSchemaFieldRemove = useCallback(
    (fieldKey: string) => {
      const newSchema = { ...outputSchema };
      delete newSchema[fieldKey];
      onOutputSchemaChange(newSchema);
    },
    [outputSchema, onOutputSchemaChange],
  );

  const handleAddSchemaField = useCallback(() => {
    const newSchema = { ...outputSchema };
    let fieldName = 'new_field';
    let counter = 1;
    while (newSchema[fieldName]) {
      fieldName = `new_field_${counter}`;
      counter++;
    }
    newSchema[fieldName] = {
      type: 'string',
      description: '',
    };
    onOutputSchemaChange(newSchema);
  }, [outputSchema, onOutputSchemaChange]);

  return (
    <Card>
      <CardHeader>
        <CollapsibleHeader
          title={t('outputSchema.title')}
          description={t('outputSchema.subtitle')}
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          count={Object.keys(outputSchema).length}
          isOpen={isOpen}
          onToggle={onToggle}
        />
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('outputSchema.structuredSchema')}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('outputSchema.structuredDescription')}
                </p>
              </div>
            </div>
          </div>

          {Object.keys(outputSchema).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(outputSchema).map(([fieldKey, field]) => (
                <SchemaField
                  key={fieldKey}
                  fieldKey={fieldKey}
                  field={field}
                  onUpdate={(newKey, newField) => handleSchemaFieldUpdate(fieldKey, newKey, newField)}
                  onRemove={handleSchemaFieldRemove}
                  isReadOnly={isReadOnly}
                />
              ))}

              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSchemaField}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('outputSchema.addField')}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed">
              <div>
                <p className="font-medium">{t('outputSchema.noSchema')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('outputSchema.addFieldsToStructure')}
                </p>
              </div>
              {!isReadOnly && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddSchemaField}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('outputSchema.firstField')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default OutputSchemaSection;
