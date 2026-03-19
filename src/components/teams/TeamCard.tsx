import { Button, Card, CardContent, Avatar, AvatarFallback, Badge } from '@evoapi/design-system';
import { Edit, Users, Trash2 } from 'lucide-react';
import { Team } from '@/types/users';
import { useLanguage } from '@/hooks/useLanguage';

type TeamCardProps = {
  team: Team;
  onManageUsers?: (team: Team) => void;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
};

export default function TeamCard({
  team,
  onManageUsers,
  onEdit,
  onDelete,
}: TeamCardProps) {
  const { t } = useLanguage('teams');

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <Card className="group relative bg-sidebar border-sidebar-border hover:bg-sidebar-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(team.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-sidebar-foreground">
              {team.name}
            </h3>
            {team.description && (
              <p className="text-xs text-sidebar-foreground/60 truncate">{team.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {team.allow_auto_assign && (
              <Badge variant="secondary" className="text-xs">
                {t('card.autoAssign')}
              </Badge>
            )}
          </div>
        </div>

        <div className="px-4 py-3 text-xs text-sidebar-foreground/70">
          <div className="flex items-center justify-between">
            <span>{t('card.id')}</span>
            <span className="font-mono">{team.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('card.members')}</span>
            <span className="font-mono">{team.members_count || 0}</span>
          </div>
        </div>

        <div className="flex border-t border-sidebar-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-12 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
            onClick={() => onManageUsers?.(team)}
          >
            <Users className="h-4 w-4 mr-2" />
            {t('card.actions.users')}
          </Button>
          <div className="w-px bg-sidebar-border" />
          <Button
            variant="ghost"
            className="rounded-none h-12 px-4 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
            onClick={() => onEdit?.(team)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('card.actions.edit')}
          </Button>
          <div className="w-px bg-sidebar-border" />
          <Button
            variant="ghost"
            className="rounded-none h-12 px-4 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={() => onDelete?.(team)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
