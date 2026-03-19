import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Separator,
} from '@evoapi/design-system';
import { Users, Settings, Save, X } from 'lucide-react';
import { Team, TeamFormData } from '@/types/users';
import { useLanguage } from '@/hooks/useLanguage';

interface TeamFormProps {
  team?: Team;
  isNew?: boolean;
  loading?: boolean;
  onSubmit: (data: TeamFormData) => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  allow_auto_assign: boolean;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  allow_auto_assign: true,
};

export default function TeamForm({
  team,
  isNew = false,
  loading = false,
  onSubmit,
  onCancel,
}: TeamFormProps) {
  const { t } = useLanguage('teams');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Load team data when editing
  useEffect(() => {
    if (team && !isNew) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        allow_auto_assign: team.allow_auto_assign ?? true,
      });
    }
  }, [team, isNew]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('form.name.required');
    } else if (formData.name.length < 2) {
      newErrors.name = t('form.name.minLength');
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('form.description.maxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const teamData: TeamFormData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      allow_auto_assign: formData.allow_auto_assign,
    };

    onSubmit(teamData);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5" />
          {t('form.basicInfo')}
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t('form.name.label')}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('form.name.placeholder')}
              className={errors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t('form.description.label')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('form.description.placeholder')}
              className={`resize-none ${errors.description ? 'border-red-500' : ''}`}
              rows={3}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('form.description.counter', { current: formData.description.length })}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5" />
          {t('form.configuration')}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t('form.autoAssign.label')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('form.autoAssign.description')}
              </p>
            </div>
            <Switch
              checked={formData.allow_auto_assign}
              onCheckedChange={(checked) => handleInputChange('allow_auto_assign', checked)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="min-w-[100px]"
          >
            <X className="h-4 w-4 mr-2" />
            {t('form.actions.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="min-w-[120px]"
        >
          {loading ? (
            t('form.actions.saving')
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isNew ? t('form.actions.create') : t('form.actions.save')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
