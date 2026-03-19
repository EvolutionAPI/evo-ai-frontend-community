import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ReactFlowProvider } from '@xyflow/react';
import { DnDProvider } from '@/contexts/DnDContext';
import { BaseFlowCanvas, type BaseFlowCanvasProps } from './BaseFlowCanvas';
import { BaseNodePanel, type NodeType, type NodeCategory } from './BaseNodePanel';

// Re-exportar os tipos para facilitar o uso
export type { NodeType, NodeCategory };
import { Button, Card, CardContent } from '@evoapi/design-system';
import { Save, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para configuração do editor
export interface BaseFlowEditorProps extends Omit<BaseFlowCanvasProps, 'onFlowDataChange'> {
  // Configurações do editor
  title?: string;
  subtitle?: string;

  // Estados do flow
  flowData?: any;
  isLoading?: boolean;
  isSaving?: boolean;
  isExecuting?: boolean;

  // Callbacks do editor
  onSave?: (flowData: any) => Promise<void> | void;
  onExecute?: (flowData: any) => Promise<void> | void;
  onStop?: () => Promise<void> | void;
  onReset?: () => Promise<void> | void;
  onFlowDataChange?: (flowData: any) => void;

  // Configurações visuais
  showHeader?: boolean;
  showToolbar?: boolean;
  headerLeftActions?: React.ReactNode;
  headerActions?: React.ReactNode;
  toolbarActions?: React.ReactNode;

  // Validação
  validateFlow?: (flowData: any) => { isValid: boolean; errors: string[] };

  // Configurações de salvamento
  autoSave?: boolean;
  autoSaveInterval?: number; // em ms

  // Configurações do Node Panel
  nodePanelNodeTypes?: Record<string, NodeType[]>;
  nodePanelCategories?: NodeCategory[];
  nodePanelTitle?: string;
  nodePanelSubtitle?: string;
  nodePanelWidth?: string;
  nodePanelMaxHeight?: string;
  enableNodePanelSearch?: boolean;
  enableNodePanelCategories?: boolean;
  showNodePanelAllCategory?: boolean;
  defaultNodePanelCategory?: string;

  // Classes CSS customizadas
  className?: string;
  headerClassName?: string;
  toolbarClassName?: string;
  canvasWrapperClassName?: string;
}

export function BaseFlowEditor({
  title,
  subtitle,
  flowData,
  isLoading = false,
  isSaving = false,
  isExecuting = false,
  onSave,
  onExecute,
  onStop,
  onReset,
  onFlowDataChange,
  showHeader = true,
  showToolbar = true,
  headerLeftActions,
  headerActions,
  toolbarActions,
  validateFlow,
  autoSave = false,
  autoSaveInterval = 30000,
  // Node Panel props
  nodePanelNodeTypes,
  nodePanelCategories,
  nodePanelTitle,
  nodePanelSubtitle,
  nodePanelWidth = 'w-[420px]',
  nodePanelMaxHeight = 'max-h-96',
  enableNodePanelSearch = true,
  enableNodePanelCategories = true,
  showNodePanelAllCategory = true,
  defaultNodePanelCategory = 'todos',
  className,
  headerClassName,
  toolbarClassName,
  canvasWrapperClassName,
  ...canvasProps
}: BaseFlowEditorProps) {
  const { t } = useLanguage('common');
  const [currentFlowData, setCurrentFlowData] = useState(flowData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const finalTitle = title || t('base.flow.editor.title');

  // Auto-save
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || !onSave) return;

    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        handleSave();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, hasUnsavedChanges, autoSaveInterval, onSave]);

  // Atualizar dados quando flowData externo muda
  useEffect(() => {
    if (flowData !== currentFlowData) {
      setCurrentFlowData(flowData);
      setHasUnsavedChanges(false);
    }
  }, [flowData]);

  // Handler para mudanças no flow
  const handleFlowDataChange = useCallback(
    (nodes: any[], edges: any[]) => {
      const newFlowData = { nodes, edges };
      setCurrentFlowData(newFlowData);
      setHasUnsavedChanges(true);

      // Validação
      if (validateFlow) {
        const validation = validateFlow(newFlowData);
        setValidationErrors(validation.errors);
      }

      // Callback externo
      if (onFlowDataChange) {
        onFlowDataChange(newFlowData);
      }
    },
    [validateFlow, onFlowDataChange]
  );

  // Handlers das ações
  const handleSave = useCallback(async () => {
    if (!onSave || !currentFlowData) return;

    try {
      await onSave(currentFlowData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao salvar flow:', error);
    }
  }, [onSave, currentFlowData]);

  const handleExecute = useCallback(async () => {
    if (!onExecute || !currentFlowData) return;

    try {
      await onExecute(currentFlowData);
    } catch (error) {
      console.error('Erro ao executar flow:', error);
    }
  }, [onExecute, currentFlowData]);

  const handleStop = useCallback(async () => {
    if (!onStop) return;

    try {
      await onStop();
    } catch (error) {
      console.error('Erro ao parar flow:', error);
    }
  }, [onStop]);

  const handleReset = useCallback(async () => {
    if (!onReset) return;

    try {
      await onReset();
      setHasUnsavedChanges(false);
      setValidationErrors([]);
    } catch (error) {
      console.error('Erro ao resetar flow:', error);
    }
  }, [onReset]);

  // Verificar se pode executar
  const canExecute = currentFlowData &&
    currentFlowData.nodes?.length > 0 &&
    validationErrors.length === 0 &&
    !isExecuting;

  return (
    <div className={cn('flex flex-col h-full bg-sidebar', className)}>
      {/* Header */}
      {showHeader && (
        <div className={cn(
          'flex-shrink-0 border-b border-sidebar-border bg-sidebar',
          headerClassName
        )}>
          <div className="flex items-center justify-between p-4">
            {/* Ações à esquerda */}
            <div className="flex items-center gap-2">
              {headerLeftActions}
            </div>

            <div className="flex-1 mx-4">
              <h1 className="text-xl font-semibold text-sidebar-foreground">
                {finalTitle}
                {hasUnsavedChanges && (
                  <span className="ml-2 text-sm text-orange-500">{t('base.flow.editor.unsaved')}</span>
                )}
              </h1>
              {subtitle && (
                <p className="text-sm text-sidebar-foreground/70 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Ações do header */}
            <div className="flex items-center gap-2">
              {headerActions}

              {/* Validação */}
              {validationErrors.length > 0 && (
                <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <p className="text-xs text-red-800 dark:text-red-200">
                        {t('base.flow.editor.errors', { count: validationErrors.length })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <div className={cn(
          'flex-shrink-0 border-b border-sidebar-border bg-sidebar-accent/30 px-4 py-2',
          toolbarClassName
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Botões principais */}
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="h-8"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isSaving ? t('base.flow.editor.saving') : t('base.flow.editor.save')}
                </Button>
              )}

              {onExecute && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={isExecuting ? handleStop : handleExecute}
                  disabled={!canExecute && !isExecuting}
                  className="h-8"
                >
                  {isExecuting ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      {t('base.flow.editor.stop')}
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      {t('base.flow.editor.execute')}
                    </>
                  )}
                </Button>
              )}

              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isExecuting}
                  className="h-8"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {t('base.flow.editor.reset')}
                </Button>
              )}
            </div>

            {/* Ações customizadas da toolbar */}
            <div className="flex items-center gap-2">
              {toolbarActions}
            </div>
          </div>
        </div>
      )}

      {/* Canvas - DIMENSÕES FIXAS PARA REACTFLOW */}
      <div className={cn('flex-1 relative w-full min-h-0', canvasWrapperClassName)} style={{ height: '100%' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-sidebar-foreground/70">{t('base.flow.editor.loading')}</p>
            </div>
          </div>
        ) : (
          <ReactFlowProvider>
            <DnDProvider>
              <BaseFlowCanvas
                {...canvasProps}
                initialNodes={currentFlowData?.nodes || []}
                initialEdges={currentFlowData?.edges || []}
                onFlowDataChange={handleFlowDataChange}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
                NodePanelComponent={
                  nodePanelNodeTypes && nodePanelCategories
                    ? ({ onClose }) => (
                        <BaseNodePanel
                          nodeTypes={nodePanelNodeTypes}
                          categories={nodePanelCategories}
                          title={nodePanelTitle}
                          subtitle={nodePanelSubtitle}
                          width={nodePanelWidth}
                          maxHeight={nodePanelMaxHeight}
                          enableSearch={enableNodePanelSearch}
                          enableCategories={enableNodePanelCategories}
                          showAllCategory={showNodePanelAllCategory}
                          defaultCategory={defaultNodePanelCategory}
                          onClose={onClose}
                        />
                      )
                    : canvasProps.NodePanelComponent
                }
              />
            </DnDProvider>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}
