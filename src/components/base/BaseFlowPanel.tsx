import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@evoapi/design-system';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para configuração do painel
export interface BaseFlowPanelProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;

  // Configurações visuais
  width?: string;
  maxHeight?: string;

  // Configurações de funcionalidade
  showCloseButton?: boolean;
  closable?: boolean;

  // Classes CSS customizadas
  className?: string;
  headerClassName?: string;
  contentClassName?: string;

  // Configurações de scroll
  scrollable?: boolean;

  // Footer customizado
  footer?: React.ReactNode;
}

export function BaseFlowPanel({
  title,
  icon,
  onClose,
  children,
  width = 'w-[420px]',
  maxHeight = 'max-h-[80vh]',
  showCloseButton = true,
  closable = true,
  className,
  headerClassName,
  contentClassName,
  scrollable = true,
  footer,
}: BaseFlowPanelProps) {
  return (
    <Card className={cn(
      'bg-sidebar border-sidebar-border shadow-lg overflow-hidden',
      width,
      maxHeight,
      className
    )}>
      {/* Header */}
      <CardHeader className={cn('pb-4 flex-shrink-0', headerClassName)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
            {icon}
            {title}
          </CardTitle>
          {showCloseButton && closable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-sidebar-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className={cn(
        'flex-1 space-y-6',
        scrollable && 'overflow-y-auto',
        contentClassName
      )}>
        {children}
      </CardContent>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 border-t border-sidebar-border p-4">
          {footer}
        </div>
      )}
    </Card>
  );
}

// Componente para seção de painel
export interface PanelSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function PanelSection({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  contentClassName,
}: PanelSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {(title || subtitle) && (
        <div className={cn('space-y-1', headerClassName)}>
          {title && (
            <h4 className="text-sm font-medium text-sidebar-foreground">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-sidebar-foreground/70">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={cn('space-y-3', contentClassName)}>
        {children}
      </div>
    </div>
  );
}

// Componente para grupo de campos
export interface FieldGroupProps {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FieldGroup({
  label,
  description,
  required = false,
  error,
  children,
  className,
  labelClassName,
}: FieldGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className={cn('space-y-1', labelClassName)}>
          <label className="text-sm font-medium text-sidebar-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-xs text-sidebar-foreground/70">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

// Componente para botões de ação do painel
export interface PanelActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function PanelActions({
  children,
  className,
  align = 'right',
}: PanelActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn(
      'flex gap-3 pt-4',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
}

// Hook para gerenciar estado do painel
export interface UsePanelStateOptions {
  initialData?: any;
  onSave?: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  validate?: (data: any) => string[] | null;
}

export function usePanelState({
  initialData = {},
  onSave,
  onCancel,
  validate,
}: UsePanelStateOptions = {}) {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Atualizar dados
  const updateData = React.useCallback((updates: any) => {
    setData((prev: any) => {
      const newData = { ...prev, ...updates };
      setHasChanges(JSON.stringify(newData) !== JSON.stringify(initialData));
      return newData;
    });
  }, [initialData]);

  // Validar dados
  const validateData = React.useCallback(() => {
    if (!validate) return true;

    const validationErrors = validate(data);
    setErrors(validationErrors || []);
    return !validationErrors || validationErrors.length === 0;
  }, [data, validate]);

  // Salvar dados
  const handleSave = React.useCallback(async () => {
    if (!validateData()) return;

    setIsLoading(true);
    try {
      if (onSave) {
        await onSave(data);
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, validateData, onSave]);

  // Cancelar alterações
  const handleCancel = React.useCallback(() => {
    setData(initialData);
    setErrors([]);
    setHasChanges(false);
    if (onCancel) {
      onCancel();
    }
  }, [initialData, onCancel]);

  // Resetar para dados iniciais
  const reset = React.useCallback(() => {
    setData(initialData);
    setErrors([]);
    setHasChanges(false);
  }, [initialData]);

  return {
    data,
    updateData,
    errors,
    isLoading,
    hasChanges,
    handleSave,
    handleCancel,
    reset,
    validateData,
  };
}
