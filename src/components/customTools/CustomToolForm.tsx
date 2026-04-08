import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
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
  Separator,
} from '@evoapi/design-system';
import {
  Wand,
  Globe,
  FileText,
  Tags,
  Plus,
  X,
} from 'lucide-react';
import { CustomTool, CustomToolFormData } from '@/types/ai';


interface CustomToolFormProps {
  tool?: CustomTool;
  mode?: 'create' | 'edit' | 'view';
  loading?: boolean;
  onSubmit: (data: CustomToolFormData) => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  path_params: Record<string, unknown>;
  query_params: Record<string, unknown>;
  body_params: Record<string, unknown>;
  error_handling: Record<string, unknown>;
  values: Record<string, unknown>;
  tags: string[];
  examples: string[];
  input_modes: string[];
  output_modes: string[];
}

const initialFormData: FormData = {
  name: '',
  description: '',
  method: 'GET',
  endpoint: '',
  headers: {},
  path_params: {},
  query_params: {},
  body_params: {},
  error_handling: {},
  values: {},
  tags: [],
  examples: [],
  input_modes: [],
  output_modes: [],
};

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function CustomToolForm({
  tool,
  mode = 'create',
  loading = false,
  onSubmit,
  onCancel,
}: CustomToolFormProps) {
  const { t } = useLanguage('customTools');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [headersJson, setHeadersJson] = useState('{}');
  const [bodyParamsJson, setBodyParamsJson] = useState('{}');
  const [queryParamsJson, setQueryParamsJson] = useState('{}');
  const [pathParamsJson, setPathParamsJson] = useState('{}');
  const [valuesJson, setValuesJson] = useState('{}');
  const [errorHandlingJson, setErrorHandlingJson] = useState('{}');
  const [tagsInput, setTagsInput] = useState('');
  const [newExample, setNewExample] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when tool changes
  useEffect(() => {
    if (tool && mode !== 'create') {
      const newFormData: FormData = {
        name: tool.name || '',
        description: tool.description || '',
        method: tool.method || 'GET',
        endpoint: tool.endpoint || '',
        headers: tool.headers as Record<string, string> || {},
        path_params: tool.path_params as Record<string, unknown> || {},
        query_params: tool.query_params as Record<string, unknown> || {},
        body_params: tool.body_params as Record<string, unknown> || {},
        error_handling: tool.error_handling as Record<string, unknown> || {},
        values: tool.values as Record<string, unknown> || {},
        tags: tool.tags || [],
        examples: tool.examples || [],
        input_modes: tool.input_modes as string[] || [],
        output_modes: tool.output_modes as string[] || [],
      };

      setFormData(newFormData);
      setHeadersJson(JSON.stringify(newFormData.headers, null, 2));
      setBodyParamsJson(JSON.stringify(newFormData.body_params, null, 2));
      setQueryParamsJson(JSON.stringify(newFormData.query_params, null, 2));
      setPathParamsJson(JSON.stringify(newFormData.path_params, null, 2));
      setValuesJson(JSON.stringify(newFormData.values, null, 2));
      setErrorHandlingJson(JSON.stringify(newFormData.error_handling, null, 2));
      setTagsInput(newFormData.tags.join(', '));
    } else {
      setFormData(initialFormData);
      setHeadersJson('{}');
      setBodyParamsJson('{}');
      setQueryParamsJson('{}');
      setPathParamsJson('{}');
      setValuesJson('{}');
      setErrorHandlingJson('{}');
      setTagsInput('');
    }
  }, [tool, mode]);

  const handleInputChange = (field: keyof FormData, value: string) => {
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

  const handleJsonFieldChange = (
    field: 'body_params' | 'query_params' | 'path_params' | 'values' | 'error_handling',
    value: string,
    setter: (value: string) => void
  ) => {
    setter(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({ ...prev, [field]: parsed }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
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

  const handleAddExample = () => {
    if (newExample.trim()) {
      setFormData(prev => ({
        ...prev,
        examples: [...prev.examples, newExample.trim()],
      }));
      setNewExample('');
    }
  };

  const handleRemoveExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('form.validation.nameRequired');
    }

    if (!formData.endpoint.trim()) {
      newErrors.endpoint = t('form.validation.endpointRequired');
    } else {
      try {
        new URL(formData.endpoint);
      } catch {
        newErrors.endpoint = t('form.validation.endpointInvalid');
      }
    }

    if (!formData.method) {
      newErrors.method = t('form.validation.methodRequired');
    }

    try {
      JSON.parse(headersJson);
    } catch {
      newErrors.headers = t('form.validation.headersInvalid');
    }

    try {
      JSON.parse(bodyParamsJson);
    } catch {
      newErrors.body_params = t('form.validation.bodyParamsInvalid');
    }

    try {
      JSON.parse(queryParamsJson);
    } catch {
      newErrors.query_params = t('form.validation.queryParamsInvalid');
    }

    try {
      JSON.parse(pathParamsJson);
    } catch {
      newErrors.path_params = t('form.validation.pathParamsInvalid');
    }

    try {
      JSON.parse(valuesJson);
    } catch {
      newErrors.values = t('form.validation.valuesInvalid');
    }

    try {
      JSON.parse(errorHandlingJson);
    } catch {
      newErrors.error_handling = t('form.validation.errorHandlingInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CustomToolFormData = {
      name: formData.name.trim(),
      description: formData.description.trim() || '',
      method: formData.method,
      endpoint: formData.endpoint.trim(),
      headers: formData.headers,
      path_params: formData.path_params,
      query_params: formData.query_params,
      body_params: formData.body_params,
      error_handling: formData.error_handling,
      values: formData.values,
      tags: formData.tags,
      examples: formData.examples,
      input_modes: formData.input_modes,
      output_modes: formData.output_modes,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wand className="h-5 w-5" />
          {t('form.sections.basicInfo')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('form.fields.name.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder={t('form.fields.name.placeholder')}
              disabled={loading}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">
              {t('form.fields.method.label')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.method}
              onValueChange={(value) => handleInputChange('method', value)}
              disabled={loading}
            >
              <SelectTrigger className={errors.method ? 'border-destructive' : ''}>
                <SelectValue placeholder={t('form.fields.method.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map(method => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && <p className="text-sm text-destructive">{errors.method}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('form.fields.description.label')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder={t('form.fields.description.placeholder')}
            disabled={loading}
            rows={3}
          />
        </div>
      </div>

      <Separator />

      {/* HTTP Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('form.sections.httpConfig')}
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">
              {t('form.fields.endpoint.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={e => handleInputChange('endpoint', e.target.value)}
              placeholder={t('form.fields.endpoint.placeholder')}
              disabled={loading}
              className={errors.endpoint ? 'border-destructive' : ''}
            />
            {errors.endpoint && <p className="text-sm text-destructive">{errors.endpoint}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="headers">{t('form.fields.headers.label')}</Label>
            <Textarea
              id="headers"
              value={headersJson}
              onChange={e => handleHeadersChange(e.target.value)}
              placeholder={t('form.fields.headers.placeholder')}
              disabled={loading}
              rows={6}
              className={`font-mono ${errors.headers ? 'border-destructive' : ''}`}
            />
            {errors.headers && <p className="text-sm text-destructive">{errors.headers}</p>}
            <p className="text-sm text-muted-foreground">
              {t('form.fields.headers.hint')}
            </p>
          </div>

          {(formData.method === 'POST' || formData.method === 'PUT' || formData.method === 'PATCH') && (
            <div className="space-y-2">
              <Label htmlFor="body_params">{t('form.fields.bodyParams.label')}</Label>
              <Textarea
                id="body_params"
                value={bodyParamsJson}
                onChange={e => handleJsonFieldChange('body_params', e.target.value, setBodyParamsJson)}
                placeholder={t('form.fields.bodyParams.placeholder')}
                disabled={loading}
                rows={6}
                className={`font-mono ${errors.body_params ? 'border-destructive' : ''}`}
              />
              {errors.body_params && <p className="text-sm text-destructive">{errors.body_params}</p>}
              <p className="text-sm text-muted-foreground">
                {t('form.fields.bodyParams.hint')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="query_params">{t('form.fields.queryParams.label')}</Label>
            <Textarea
              id="query_params"
              value={queryParamsJson}
              onChange={e => handleJsonFieldChange('query_params', e.target.value, setQueryParamsJson)}
              placeholder={t('form.fields.queryParams.placeholder')}
              disabled={loading}
              rows={6}
              className={`font-mono ${errors.query_params ? 'border-destructive' : ''}`}
            />
            {errors.query_params && <p className="text-sm text-destructive">{errors.query_params}</p>}
            <p className="text-sm text-muted-foreground">
              {t('form.fields.queryParams.hint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="path_params">{t('form.fields.pathParams.label')}</Label>
            <Textarea
              id="path_params"
              value={pathParamsJson}
              onChange={e => handleJsonFieldChange('path_params', e.target.value, setPathParamsJson)}
              placeholder={t('form.fields.pathParams.placeholder')}
              disabled={loading}
              rows={6}
              className={`font-mono ${errors.path_params ? 'border-destructive' : ''}`}
            />
            {errors.path_params && <p className="text-sm text-destructive">{errors.path_params}</p>}
            <p className="text-sm text-muted-foreground">
              {t('form.fields.pathParams.hint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="values">{t('form.fields.values.label')}</Label>
            <Textarea
              id="values"
              value={valuesJson}
              onChange={e => handleJsonFieldChange('values', e.target.value, setValuesJson)}
              placeholder={t('form.fields.values.placeholder')}
              disabled={loading}
              rows={6}
              className={`font-mono ${errors.values ? 'border-destructive' : ''}`}
            />
            {errors.values && <p className="text-sm text-destructive">{errors.values}</p>}
            <p className="text-sm text-muted-foreground">
              {t('form.fields.values.hint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="error_handling">{t('form.fields.errorHandling.label')}</Label>
            <Textarea
              id="error_handling"
              value={errorHandlingJson}
              onChange={e => handleJsonFieldChange('error_handling', e.target.value, setErrorHandlingJson)}
              placeholder={t('form.fields.errorHandling.placeholder')}
              disabled={loading}
              rows={6}
              className={`font-mono ${errors.error_handling ? 'border-destructive' : ''}`}
            />
            {errors.error_handling && <p className="text-sm text-destructive">{errors.error_handling}</p>}
            <p className="text-sm text-muted-foreground">
              {t('form.fields.errorHandling.hint')}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Tags className="h-5 w-5" />
          {t('form.sections.tags')}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="tags">{t('form.fields.tags.label')}</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={e => handleTagsChange(e.target.value)}
            placeholder={t('form.fields.tags.placeholder')}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            {t('form.fields.tags.hint')}
          </p>
        </div>
      </div>

      <Separator />

      {/* Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('form.sections.examples')}
        </h3>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newExample}
              onChange={e => setNewExample(e.target.value)}
              placeholder={t('form.fields.examples.placeholder')}
              disabled={loading}
              onKeyPress={e => e.key === 'Enter' && handleAddExample()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddExample}
              disabled={loading || !newExample.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.examples.length > 0 && (
            <div className="space-y-2">
              {formData.examples.map((example, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <span className="flex-1 text-sm">{example}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExample(index)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
            {t('form.actions.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/85 text-primary-foreground border-0 font-semibold flex-1"
        >
          {loading
            ? t('form.actions.saving')
            : mode === 'create'
              ? t('form.actions.create')
              : t('form.actions.save')}
        </Button>
      </div>
    </form>
  );
}
