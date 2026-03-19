import {
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@evoapi/design-system';
import {
  ArrowLeft,
  Save,
  X,
  Edit3,
  Copy,
  MoreHorizontal,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

type AgentPageMode = 'create' | 'edit' | 'view';

interface AgentHeaderProps {
  mode: AgentPageMode;
  agentName: string;
  isDirty: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onViewMode?: () => void;
}

const AgentHeader = ({
  mode,
  agentName,
  isDirty,
  isSaving,
  onBack,
  onSave,
  onCancel,
  onEdit,
  onDuplicate,
}: // onViewMode,
AgentHeaderProps) => {
  const { t } = useLanguage('aiAgents');

  const getPageTitle = () => {
    switch (mode) {
      case 'create':
        return t('header.createAgent');
      case 'edit':
        return agentName || t('header.loading');
      case 'view':
        return agentName || t('header.agent');
      default:
        return t('header.agent');
    }
  };

  const getPageSubtitle = () => {
    switch (mode) {
      case 'create':
        return t('header.createSubtitle');
      case 'edit':
        return t('header.editSubtitle');
      case 'view':
        return t('header.viewSubtitle');
      default:
        return '';
    }
  };

  const getBreadcrumb = () => {
    const items = [{ label: t('header.agents'), href: '/agents' }];

    if (mode === 'create') {
      items.push({ label: t('header.new'), href: '' });
    } else {
      items.push({ label: agentName || t('header.loading'), href: '' });
      if (mode === 'edit') {
        items.push({ label: t('header.edit'), href: '' });
      }
    }

    return items;
  };

  const renderActions = () => {
    if (mode === 'view') {
      return (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button onClick={onEdit} className="gap-2">
              <Edit3 className="h-4 w-4" />
              {t('actions.edit')}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('actions.duplicate')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('actions.backToList')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    // Actions para create/edit
    return (
      <div className="flex items-center gap-2">
        {/* Switch to view mode (only for edit) */}
        {/* {mode === 'edit' && onViewMode && (
          <Button variant="ghost" size="sm" onClick={onViewMode} className="gap-2 flex-shrink-0">
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">{t('actions.view')}</span>
          </Button>
        )} */}

        {/* Cancel button */}
        <Button variant="outline" size="sm" onClick={onCancel} className="gap-2 flex-shrink-0">
          <X className="h-4 w-4" />
          <span className="hidden md:inline">{t('actions.cancel')}</span>
        </Button>

        {/* Save button */}
        <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-2 flex-shrink-0">
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isSaving ? t('actions.saving') : t('actions.save')}
          </span>
          <span className="sm:hidden">{isSaving ? '...' : t('actions.save')}</span>
        </Button>
      </div>
    );
  };

  const breadcrumbItems = getBreadcrumb();

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sm:p-6">
      {/* Primeira linha: Botão voltar + Breadcrumb */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t('actions.back')}</span>
        </Button>

        {/* Breadcrumb - Responsivo com truncate */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden">
          {breadcrumbItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 flex-shrink-0 last:flex-shrink min-w-0"
            >
              {index > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
              <span
                className={`${
                  index === breadcrumbItems.length - 1
                    ? 'text-foreground font-medium'
                    : 'hover:text-foreground cursor-pointer'
                } ${index === breadcrumbItems.length - 1 ? 'truncate min-w-0' : ''}`}
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Segunda linha: Layout responsivo */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* Título + Badges + Descrição */}
        <div className="min-w-0 flex-1">
          {/* Título e badges - responsivo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Bot className="h-6 w-6 text-primary flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                {getPageTitle()}
              </h1>
            </div>

            {/* Badges em linha separada no mobile */}
            <div className="flex items-center gap-2 flex-wrap">
              {mode !== 'create' && (
                <Badge variant="outline" className="text-xs">
                  {mode === 'edit' ? t('header.editing') : t('header.viewing')}
                </Badge>
              )}
              {isDirty && mode !== 'view' && (
                <Badge variant="secondary" className="text-xs">
                  {t('header.modified')}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">{getPageSubtitle()}</p>
        </div>

        {/* Ações - Stack em mobile */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          {renderActions()}
        </div>
      </div>
    </div>
  );
};

export default AgentHeader;
