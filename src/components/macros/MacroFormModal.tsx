import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Separator,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@evoapi/design-system';
import { Plus, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Macro, MACRO_ACTION_TYPES } from '@/types/automation';
import { macrosService } from '@/services/macros';
import MacroActionRow from './MacroActionRow';

interface MacroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  macro?: Macro | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  visibility: 'personal' | 'global';
  actions: Array<{
    action_name: string;
    action_params: any[];
  }>;
}

const initialFormData: FormData = {
  name: '',
  visibility: 'personal',
  actions: [
    {
      action_name: 'assign_team',
      action_params: [],
    },
  ],
};

export default function MacroFormModal({ isOpen, onClose, macro, onSuccess }: MacroFormModalProps) {
  const { t } = useLanguage('macros');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formDataOptions, setFormDataOptions] = useState<{
    inboxes: any[];
    agents: any[];
    teams: any[];
    labels: any[];
    campaigns: any[];
  }>({
    inboxes: [],
    agents: [],
    teams: [],
    labels: [],
    campaigns: [],
  });

  const isEditing = !!macro;

  // Carregar dados do formulário
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  // Carregar dados da macro para edição
  useEffect(() => {
    if (isOpen) {
      if (macro) {
        setFormData({
          name: macro.name,
          visibility: macro.visibility,
          actions: macro.actions,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, macro]);

  const loadFormData = async () => {
    try {
      const data = await macrosService.getFormData();
      setFormDataOptions(data);
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('modal.validation.nameRequired');
    }

    if (formData.actions.length === 0) {
      newErrors.actions = t('modal.validation.actionsRequired');
    }

    // Validar ações
    formData.actions.forEach((action, index) => {
      if (!action.action_name) {
        newErrors[`action_${index}_name`] = t('modal.validation.actionTypeRequired');
      }

      // Validar parâmetros para ações que precisam
      const actionType = MACRO_ACTION_TYPES.find(type => type.key === action.action_name);
      if (actionType && actionType.inputType && actionType.inputType !== null) {
        // Para multi_select, verificar se tem pelo menos um item selecionado
        if (actionType.inputType === 'multi_select') {
          if (!action.action_params || action.action_params.length === 0) {
            newErrors[`action_${index}_params`] = t('modal.validation.selectAtLeastOne');
          }
        }
        // Para outros tipos com input, verificar se o primeiro parâmetro existe
        else if (
          !action.action_params ||
          action.action_params.length === 0 ||
          (!action.action_params[0] && action.action_params[0] !== 0)
        ) {
          newErrors[`action_${index}_params`] = t('modal.validation.fieldRequired');
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await macrosService.updateMacro(macro.id, formData);
        toast.success(t('messages.updateSuccess'));
      } else {
        await macrosService.createMacro(formData);
        toast.success(t('messages.createSuccess'));
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving macro:', error);
      toast.error(isEditing ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          action_name: 'assign_team',
          action_params: [],
        },
      ],
    }));
  };

  const removeAction = (index: number) => {
    if (formData.actions.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const updateAction = (index: number, updatedAction: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => (i === index ? updatedAction : action)),
    }));

    // Limpar erros relacionados à ação
    const newErrors = { ...errors };
    delete newErrors[`action_${index}_name`];
    delete newErrors[`action_${index}_params`];
    setErrors(newErrors);
  };

  // const getActionTypeLabel = (actionType: string) => {
  //   const actionTypeObj = MACRO_ACTION_TYPES.find(type => type.key === actionType);
  //   return actionTypeObj?.name || actionType;
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[85vw] min-w-[700px] max-h-[90vh] overflow-y-auto bg-sidebar border-sidebar-border">
        <DialogHeader>
          <DialogTitle className="text-sidebar-foreground">
            {isEditing ? t('modal.title.edit') : t('modal.title.create')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sidebar-foreground">
                {t('modal.form.name')} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                placeholder={t('modal.form.namePlaceholder')}
                className={`w-full bg-sidebar border-sidebar-border text-sidebar-foreground ${
                  errors.name ? 'border-red-500' : ''
                }`}
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Visibilidade */}
            <div className="space-y-4">
              <Label className="text-sidebar-foreground">{t('modal.form.visibility')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    formData.visibility === 'personal'
                      ? 'border-primary bg-primary/5'
                      : 'border-sidebar-border hover:border-sidebar-accent'
                  }`}
                  onClick={() => handleFieldChange('visibility', 'personal')}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base">
                        {t('modal.form.visibilityPersonal')}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="text-sm">
                      {t('modal.form.visibilityPersonalDesc')}
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    formData.visibility === 'global'
                      ? 'border-primary bg-primary/5'
                      : 'border-sidebar-border hover:border-sidebar-accent'
                  }`}
                  onClick={() => handleFieldChange('visibility', 'global')}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-base">
                        {t('modal.form.visibilityGlobal')}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="text-sm">
                      {t('modal.form.visibilityGlobalDesc')}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Ações */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-sidebar-foreground">
                  {t('modal.form.actionsTitle')}
                </h3>
                <p className="text-sm text-sidebar-foreground/60">
                  {t('modal.form.actionsSubtitle')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
                disabled={loading}
                className="bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('modal.form.addAction')}
              </Button>
            </div>

            {errors.actions && <p className="text-sm text-red-500">{errors.actions}</p>}

            <div className="space-y-4">
              {formData.actions.map((action, index) => (
                <MacroActionRow
                  key={index}
                  action={action}
                  index={index}
                  options={formDataOptions}
                  onUpdate={updateAction}
                  onRemove={removeAction}
                  canRemove={formData.actions.length > 1}
                  errors={errors}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {t('modal.buttons.cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#00ffa7] hover:bg-[#00e693] text-black border-0 font-semibold"
          >
            {loading
              ? t('modal.buttons.saving')
              : isEditing
              ? t('modal.buttons.update')
              : t('modal.buttons.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
