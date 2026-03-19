import { useLanguage } from '@/hooks/useLanguage';
import { Badge } from '@evoapi/design-system';
import { Server, Eye, Wrench } from 'lucide-react';
import { MCPServer } from '@/types/ai';
import { BaseTable, TableColumn, TableAction } from '@/components/base';

interface MCPServersTableProps {
  servers: MCPServer[];
  selectedServers: MCPServer[];
  loading?: boolean;
  onSelectionChange: (servers: MCPServer[]) => void;
  onServerClick: (server: MCPServer) => void;
}

export default function MCPServersTable({
  servers,
  selectedServers,
  loading,
  onSelectionChange,
  onServerClick,
}: MCPServersTableProps) {
  const { t } = useLanguage('mcpServers');
  const serversList = servers || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'official':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'community':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'oauth':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'webhook':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'basic_auth':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'credentials':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };

  const columns: TableColumn<MCPServer>[] = [
    {
      key: 'server',
      label: t('table.columns.server'),
      sortable: true,
      render: server => (
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 py-2"
          onClick={() => onServerClick(server)}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate mb-1">{server.name || t('table.noName')}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className={`text-xs ${getTypeColor(server.type)}`}>
                {server.type}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getTypeColor(server.config_type)}`}>
                {server.config_type?.toUpperCase() || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: t('table.columns.description'),
      sortable: false,
      render: server => (
        <div className="max-w-[300px]">
          <p className="text-sm text-muted-foreground truncate">
            {server.description || t('table.noDescription')}
          </p>
        </div>
      ),
    },
    {
      key: 'tools',
      label: t('table.columns.tools'),
      sortable: false,
      render: server => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-muted-foreground">
            {server.tools?.length || 0}
          </span>
        </div>
      ),
    }
  ];

  const actions: TableAction<MCPServer>[] = [
    {
      label: t('table.actions.viewDetails'),
      icon: <Eye className="h-4 w-4" />,
      onClick: onServerClick,
    },
  ];

  return (
    <BaseTable<MCPServer>
      data={serversList}
      columns={columns}
      actions={actions}
      selectable
      selectedItems={selectedServers}
      onSelectionChange={onSelectionChange}
      loading={loading}
      emptyMessage={t('table.empty.message')}
      emptyIcon={Server}
      emptyTitle={t('table.empty.title')}
      emptyDescription={t('table.empty.description')}
      emptyAction={undefined}
      getRowKey={server => String(server.id)}
      className="border-0 shadow-none"
    />
  );
}
