import { Badge } from '@evoapi/design-system';
import { Wrench, Eye } from 'lucide-react';
import { Tool } from '@/types/ai';
import { BaseTable, TableColumn, TableAction } from '@/components/base';
import { useLanguage } from '@/hooks/useLanguage';

interface ToolsTableProps {
  tools: Tool[];
  selectedTools: Tool[];
  loading?: boolean;
  onSelectionChange: (tools: Tool[]) => void;
  onToolClick: (tool: Tool) => void;
}

export default function ToolsTable({
  tools,
  selectedTools,
  loading,
  onSelectionChange,
  onToolClick,
}: ToolsTableProps) {
  const { t } = useLanguage('tools');
  const toolsList = tools || [];

  const columns: TableColumn<Tool>[] = [
    {
      key: 'tool',
      label: t('table.columns.tool'),
      sortable: true,
      render: tool => (
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 py-2"
          onClick={() => onToolClick(tool)}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate mb-1">
              {tool.name || t('table.noName')}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {tool.description || t('table.noDescription')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'tags',
      label: t('table.columns.tags'),
      sortable: false,
      render: tool => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {tool.tags && tool.tags.length > 0 ? (
            tool.tags.slice(0, 3).map((tag: any, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">{t('table.noTags')}</span>
          )}
          {tool.tags && tool.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tool.tags.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'examples',
      label: t('table.columns.examples'),
      sortable: false,
      render: tool => (
        <span className="text-sm text-muted-foreground">{tool.examples?.length || 0}</span>
      ),
    },
    {
      key: 'input_modes',
      label: t('table.columns.input'),
      sortable: false,
      render: tool => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {tool.inputModes && tool.inputModes.length > 0 ? (
            tool.inputModes.slice(0, 2).map((mode: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {mode}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
          {tool.inputModes && tool.inputModes.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tool.inputModes.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'output_modes',
      label: t('table.columns.output'),
      sortable: false,
      render: tool => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {tool.outputModes && tool.outputModes.length > 0 ? (
            tool.outputModes.slice(0, 2).map((mode: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {mode}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
          {tool.outputModes && tool.outputModes.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tool.outputModes.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const actions: TableAction<Tool>[] = [
    {
      label: t('table.actions.viewDetails'),
      icon: <Eye className="h-4 w-4" />,
      onClick: onToolClick,
    },
  ];

  return (
    <BaseTable<Tool>
      data={toolsList}
      columns={columns}
      actions={actions}
      selectable
      selectedItems={selectedTools}
      onSelectionChange={onSelectionChange}
      loading={loading}
      emptyMessage={t('table.empty.message')}
      emptyIcon={Wrench}
      emptyTitle={t('table.empty.title')}
      emptyDescription={t('table.empty.description')}
      getRowKey={tool => String(tool.id)}
      className="border-0 shadow-none"
    />
  );
}
