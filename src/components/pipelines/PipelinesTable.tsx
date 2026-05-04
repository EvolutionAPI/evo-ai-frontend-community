import { useLanguage } from '@/hooks/useLanguage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@evoapi/design-system';
import { Button } from '@evoapi/design-system';
import {
  Eye,
  Edit,
  Trash2,
  Copy,
  CopyPlus,
  Power,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@evoapi/design-system';
import { Pipeline } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface PipelinesTableProps {
  pipelines: Pipeline[];
  loading: boolean;
  onView: (pipeline: Pipeline) => void;
  onEdit: (pipeline: Pipeline) => void;
  onDelete: (pipeline: Pipeline) => void;
  onDuplicate: (pipeline: Pipeline) => void;
  onToggleStatus: (pipeline: Pipeline) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export default function PipelinesTable({
  pipelines,
  loading,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  sortBy,
  sortOrder,
  onSort,
}: PipelinesTableProps) {
  const { t } = useLanguage('pipelines');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1 inline" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted-foreground">{t('pipelinesTable.loading')}</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort('name')}
            >
              {t('pipelinesTable.columns.name')}
              {renderSortIcon('name')}
            </TableHead>
            <TableHead>{t('pipelinesTable.columns.type')}</TableHead>
            <TableHead>{t('pipelinesTable.columns.status')}</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-center"
              onClick={() => onSort('conversations_count')}
            >
              {t('pipelinesTable.columns.conversations')}
              {renderSortIcon('conversations_count')}
            </TableHead>
            <TableHead className="text-center">{t('pipelinesTable.columns.completedPipelines')}</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort('created_at')}
            >
              {t('pipelinesTable.columns.createdAt')}
              {renderSortIcon('created_at')}
            </TableHead>
            <TableHead className="text-right">{t('pipelinesTable.columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pipelines.map((pipeline) => (
            <TableRow key={pipeline.id}>
              <TableCell className="font-medium">
                <button
                  onClick={() => onView(pipeline)}
                  className="hover:underline text-primary"
                >
                  {pipeline.name}
                </button>
                {pipeline.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {pipeline.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  pipeline.pipeline_type === 'sales' && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
                  pipeline.pipeline_type === 'support' && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
                  pipeline.pipeline_type === 'marketing' && "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
                  pipeline.pipeline_type === 'custom' && "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400",
                )}>
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  pipeline.is_active
                    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"
                )}>
                  {pipeline.is_active ? t('pipelinesTable.status.active') : t('pipelinesTable.status.inactive')}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {pipeline.conversations_count || 0}
              </TableCell>
              <TableCell className="text-right">
                {pipeline.services_info?.total_value ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    R$ {formatCurrency(pipeline.services_info.total_value)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{formatDate(pipeline.created_at as string)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(pipeline)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('pipelinesTable.actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(pipeline)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('pipelinesTable.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(pipeline)}>
                      <CopyPlus className="h-4 w-4 mr-2" />
                      {t('pipelinesTable.actions.duplicate')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        await navigator.clipboard.writeText(String(pipeline.id));
                        toast.success(t('pipelinesTable.actions.idCopied'));
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t('pipelinesTable.actions.copyId')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(pipeline)}>
                      <Power className="h-4 w-4 mr-2" />
                      {pipeline.is_active ? t('pipelinesTable.actions.deactivate') : t('pipelinesTable.actions.activate')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(pipeline)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('pipelinesTable.actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
