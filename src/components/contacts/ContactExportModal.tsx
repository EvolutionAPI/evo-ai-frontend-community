import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
  Checkbox,
} from '@evoapi/design-system';
import { Download, FileSpreadsheet } from 'lucide-react';
import { BaseFilter as ContactFilter } from '@/types/core';

interface ContactExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (params: ExportParams) => Promise<void>;
  loading?: boolean;
  activeFilters?: ContactFilter[];
  totalCount?: number;
}

interface ExportParams {
  format: 'csv' | 'xlsx';
  fields: string[];
  includeFilters: boolean;
  payload?: any;
}

// EXPORT_FIELDS moved inside component to access t()

export default function ContactExportModal({
  open,
  onOpenChange,
  onExport,
  loading = false,
  activeFilters = [],
  totalCount = 0,
}: ContactExportModalProps) {
  const { t } = useLanguage('contacts');
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');

  const EXPORT_FIELDS = [
    { id: 'name', label: t('export.fields.name'), required: true },
    { id: 'email', label: t('export.fields.email'), required: true },
    { id: 'phone_number', label: t('export.fields.phone'), required: false },
    { id: 'identifier', label: t('export.fields.identifier'), required: false },
    { id: 'created_at', label: t('export.fields.createdAt'), required: false },
    { id: 'last_activity_at', label: t('export.fields.lastActivity'), required: false },
    { id: 'labels', label: t('export.fields.labels'), required: false },
    { id: 'custom_attributes', label: t('export.fields.customAttributes'), required: false },
  ];

  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter(f => f.required).map(f => f.id)
  );
  const [includeFilters, setIncludeFilters] = useState(true);

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    const field = EXPORT_FIELDS.find(f => f.id === fieldId);
    if (field?.required) return; // Don't allow unchecking required fields

    if (checked) {
      setSelectedFields([...selectedFields, fieldId]);
    } else {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: ExportParams = {
        format,
        fields: selectedFields,
        includeFilters: includeFilters && activeFilters.length > 0,
      };

      // If filters are active and should be included, add them to payload
      if (params.includeFilters) {
        params.payload = activeFilters.map(filter => ({
          attribute_key: filter.attributeKey,
          filter_operator: filter.filterOperator,
          values: Array.isArray(filter.values) ? filter.values : [filter.values],
          query_operator: filter.queryOperator,
        }));
      }

      await onExport(params);
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting contacts:', error);
    } finally {
      setExporting(false);
    }
  };

  const getExportDescription = () => {
    if (activeFilters.length > 0 && includeFilters) {
      return t('export.description', { count: totalCount });
    }
    return t('export.descriptionAll', { count: totalCount });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>
            {getExportDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>{t('export.format.title')}</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={format === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('csv')}
                className="flex-1"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {t('export.format.csv')}
              </Button>
              <Button
                type="button"
                variant={format === 'xlsx' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('xlsx')}
                className="flex-1"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {t('export.format.excel')}
              </Button>
            </div>
          </div>

          {/* Filter Option */}
          {activeFilters.length > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="include-filters"
                checked={includeFilters}
                onCheckedChange={(checked) => setIncludeFilters(checked as boolean)}
              />
              <Label
                htmlFor="include-filters"
                className="text-sm font-normal cursor-pointer"
              >
                {t('export.filters.title', { count: activeFilters.length })}
              </Label>
            </div>
          )}

          {/* Field Selection */}
          <div className="space-y-2">
            <Label>{t('export.fields.title')}</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {EXPORT_FIELDS.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                    disabled={field.required}
                  />
                  <Label
                    htmlFor={field.id}
                    className={`text-sm font-normal cursor-pointer ${
                      field.required ? 'text-gray-500' : ''
                    }`}
                  >
                    {field.label}
                    {field.required && ` ${t('export.fields.required')}`}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t('export.download.title')}
            </h4>
            <p className="text-xs text-blue-700">
              {t('export.download.description')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || exporting}
          >
            {t('export.actions.cancel')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedFields.length === 0 || loading || exporting}
          >
            {exporting ? t('export.actions.exporting') : t('export.actions.export')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
