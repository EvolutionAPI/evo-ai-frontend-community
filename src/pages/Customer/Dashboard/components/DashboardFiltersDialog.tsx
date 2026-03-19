import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@evoapi/design-system';
import type { DashboardFilterState, DashboardOption } from './types';

interface DashboardFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftFilters: DashboardFilterState;
  onFiltersChange: (changes: Partial<DashboardFilterState>) => void;
  onApply: () => void;
  onClear: () => void;
  pipelines: DashboardOption[];
  teams: DashboardOption[];
  inboxes: DashboardOption[];
  users: DashboardOption[];
  allValue: string;
  t: (key: string) => string;
}

const DashboardFiltersDialog = ({
  open,
  onOpenChange,
  draftFilters,
  onFiltersChange,
  onApply,
  onClear,
  pipelines,
  teams,
  inboxes,
  users,
  allValue,
  t,
}: DashboardFiltersDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('dashboard.filters.title') || 'Filtros'}</DialogTitle>
          <DialogDescription>
            {t('dashboard.filters.subtitle') || 'Refine os indicadores por pipeline, equipe, canal e período'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dashboard-pipeline-filter">{t('dashboard.filters.pipeline') || 'Pipeline'}</Label>
            <Select value={draftFilters.pipelineId} onValueChange={value => onFiltersChange({ pipelineId: value })}>
              <SelectTrigger id="dashboard-pipeline-filter">
                <SelectValue placeholder={t('dashboard.filters.allPipelines') || 'Todos os pipelines'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>{t('dashboard.filters.allPipelines') || 'Todos os pipelines'}</SelectItem>
                {pipelines.map(pipeline => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-team-filter">{t('dashboard.filters.team') || 'Equipe'}</Label>
            <Select value={draftFilters.teamId} onValueChange={value => onFiltersChange({ teamId: value })}>
              <SelectTrigger id="dashboard-team-filter">
                <SelectValue placeholder={t('dashboard.filters.allTeams') || 'Todas as equipes'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>{t('dashboard.filters.allTeams') || 'Todas as equipes'}</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-inbox-filter">{t('dashboard.filters.channel') || 'Canal'}</Label>
            <Select value={draftFilters.inboxId} onValueChange={value => onFiltersChange({ inboxId: value })}>
              <SelectTrigger id="dashboard-inbox-filter">
                <SelectValue placeholder={t('dashboard.filters.allChannels') || 'Todos os canais'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>{t('dashboard.filters.allChannels') || 'Todos os canais'}</SelectItem>
                {inboxes.map(inbox => (
                  <SelectItem key={inbox.id} value={inbox.id}>
                    {inbox.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-user-filter">{t('dashboard.filters.user') || 'Usuário'}</Label>
            <Select value={draftFilters.userId} onValueChange={value => onFiltersChange({ userId: value })}>
              <SelectTrigger id="dashboard-user-filter">
                <SelectValue placeholder={t('dashboard.filters.allUsers') || 'Todos os usuários'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>{t('dashboard.filters.allUsers') || 'Todos os usuários'}</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-since-filter">{t('dashboard.filters.since') || 'De'}</Label>
            <Input
              id="dashboard-since-filter"
              type="date"
              value={draftFilters.since}
              onChange={event => onFiltersChange({ since: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-until-filter">{t('dashboard.filters.until') || 'Até'}</Label>
            <Input
              id="dashboard-until-filter"
              type="date"
              value={draftFilters.until}
              onChange={event => onFiltersChange({ until: event.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClear}>
            {t('dashboard.filters.clear') || 'Limpar filtros'}
          </Button>
          <Button onClick={onApply}>{t('dashboard.filters.apply') || 'Aplicar filtros'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardFiltersDialog;
