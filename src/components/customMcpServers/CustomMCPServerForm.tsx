import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Button,
  Input,
  Label,
  Textarea,
  Separator,
} from '@evoapi/design-system';
import {
  TestTube,
  FileText,
  Globe,
  Clock,
  RotateCcw,
  Tags,
} from 'lucide-react';
import { CustomMcpServer, CustomMcpServerFormData } from '@/types/ai';


interface CustomMCPServerFormProps {
  server?: CustomMcpServer;
  mode?: 'create' | 'edit' | 'view';
  loading?: boolean;
  onSubmit: (data: CustomMcpServerFormData) => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  url: string;
  headers: Record<string, string>;
  timeout: number;
  retry_count: number;
  tags: string[];
}

const initialFormData: FormData = {
  name: '',
  description: '',
  url: '',
  headers: {},
  timeout: 30,
  retry_count: 3,
  tags: [],
};

export default function CustomMCPServerForm({
  server,
  mode = 'create',
  loading = false,
  onSubmit,
  onCancel,
}: CustomMCPServerFormProps) {
  const { t } = useLanguage('customMcpServers');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [headersJson, setHeadersJson] = useState('{}');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when server changes
  useEffect(() => {
    if (server && mode !== 'create') {
      const newFormData: FormData = {
        name: server.name || '',
        description: server.description || '',
        url: server.url || '',
        headers: server.headers as Record<string, string> || {},
        timeout: server.timeout || 30,
        retry_count: server.retry_count || 3,
        tags: server.tags || [],
      };

      setFormData(newFormData);
      setHeadersJson(JSON.stringify(newFormData.headers, null, 2));
      setTagsInput(newFormData.tags.join(', '));
    } else {
      setFormData(initialFormData);
      setHeadersJson('{}');
      setTagsInput('');
    }
  }, [server, mode]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleHeadersChange = (value: string) => {
    setHeadersJson(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({ ...prev, headers: parsed }));
      if (errors.headers) {
        setErrors(prev => ({ ...prev, headers: '' }));
      }
    } catch {
      // Invalid JSON, don't update formData but show error on submit
    }
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('form.validation.nameRequired');
    }

    if (!formData.url.trim()) {
      newErrors.url = t('form.validation.urlRequired');
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = t('form.validation.urlInvalid');
      }
    }

    if (formData.timeout < 1 || formData.timeout > 300) {
      newErrors.timeout = t('form.validation.timeoutRange');
    }

    if (formData.retry_count < 0 || formData.retry_count > 10) {
      newErrors.retry_count = t('form.validation.retriesRange');
    }

    try {
      JSON.parse(headersJson);
    } catch {
      newErrors.headers = t('form.validation.headersInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CustomMcpServerFormData = {
      name: formData.name.trim(),
      description: formData.description.trim() || '',
      url: formData.url.trim(),
      headers: formData.headers,
      timeout: formData.timeout,
      retry_count: formData.retry_count,
      tags: formData.tags,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          {t('form.sections.basicInfo')}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('form.labels.name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder={t('form.placeholders.name')}
              disabled={loading}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.labels.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder={t('form.placeholders.description')}
              disabled={loading}
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Connection Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('form.sections.connection')}
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">
              {t('form.labels.url')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={e => handleInputChange('url', e.target.value)}
              placeholder={t('form.placeholders.url')}
              disabled={loading}
              className={errors.url ? 'border-destructive' : ''}
            />
            {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="headers">{t('form.labels.headers')}</Label>
            <Textarea
              id="headers"
              value={headersJson}
              onChange={e => handleHeadersChange(e.target.value)}
              placeholder={t('form.placeholders.headers')}
              disabled={loading}
              rows={6}
              className={`font-mono ${errors.headers ? 'border-destructive' : ''}`}
            />
            {errors.headers && <p className="text-sm text-destructive">{errors.headers}</p>}
            <p className="text-sm text-muted-foreground">
              {t('form.hints.headers')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t('form.labels.timeout')}
              </Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                max="300"
                value={formData.timeout}
                onChange={e => handleInputChange('timeout', parseInt(e.target.value) || 30)}
                disabled={loading}
                className={errors.timeout ? 'border-destructive' : ''}
              />
              {errors.timeout && <p className="text-sm text-destructive">{errors.timeout}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="retry_count" className="flex items-center gap-1">
                <RotateCcw className="h-4 w-4" />
                {t('form.labels.retries')}
              </Label>
              <Input
                id="retry_count"
                type="number"
                min="0"
                max="10"
                value={formData.retry_count}
                onChange={e => handleInputChange('retry_count', parseInt(e.target.value) || 3)}
                disabled={loading}
                className={errors.retry_count ? 'border-destructive' : ''}
              />
              {errors.retry_count && <p className="text-sm text-destructive">{errors.retry_count}</p>}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Tags className="h-5 w-5" />
          {t('form.sections.advanced')}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="tags">{t('form.labels.tags')}</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={e => handleTagsChange(e.target.value)}
            placeholder={t('form.placeholders.tags')}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            {t('form.hints.tags')}
          </p>
        </div>
      </div>

      <Separator />

      {/* Tools Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('form.sections.tools')}
        </h3>
        <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
          <div className="text-center">
            <TestTube className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {server?.tools?.length
                ? t('form.toolsInfo.configured', { count: server.tools.length })
                : t('form.toolsInfo.notConfigured')
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.toolsInfo.autoDiscovery')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            {t('form.buttons.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-semibold flex-1"
        >
          {loading ? t('form.buttons.saving') : mode === 'create' ? t('form.buttons.create') : t('form.buttons.update')}
        </Button>
      </div>
    </form>
  );
}
