import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { Button, Checkbox, Avatar, AvatarFallback, AvatarImage } from '@evoapi/design-system';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import BaseHeader from '@/components/base/BaseHeader';
import BaseTable, { TableColumn } from '@/components/base/BaseTable';
import TeamsService from '@/services/teams/teamsService';
import type { Team } from '@/types/users';
import { usersService } from '@/services/users';
import type { User } from '@/types/users';

const AddUsers: React.FC = () => {
  const { t } = useLanguage('teams');
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();

  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [savedUsers, setSavedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadData();
    }
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);
      const [teamResponse, usersResponse, membersResponse] = await Promise.all([
        TeamsService.getTeam(teamId),
        usersService.getUsers(),
        TeamsService.getTeamMembers(teamId),
      ]);

      setTeam(teamResponse);
      setUsers(usersResponse.data || []);
      const existingMemberIds = membersResponse.map((m: any) => m.user_id || m.user?.id || m.id).filter(Boolean);
      setSavedUsers(existingMemberIds);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error(t('messages.loadDataError'));
      navigate('/settings/teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSaveUsers = async () => {
    if (!teamId || selectedUsers.length === 0) {
      toast.error(t('messages.selectAtLeastOne'));
      return;
    }

    try {
      setIsSaving(true);
      await TeamsService.addUsersToTeam(teamId, selectedUsers);
      setSavedUsers(prev => [...new Set([...prev, ...selectedUsers])]);
      setSelectedUsers([]);
      toast.success(t('messages.usersAddedSuccess'));
    } catch (error) {
      console.error('Erro ao adicionar usuários:', error);
      toast.error(t('messages.addUsersError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate('/settings/teams'); // Navigate back to teams list
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return t('addUsers.table.status.online');
      case 'busy':
        return t('addUsers.table.status.busy');
      case 'offline':
        return t('addUsers.table.status.offline');
      default:
        return t('addUsers.table.status.offline');
    }
  };

  const availableUsers = users.filter(u => !savedUsers.includes(u.id));

  const handleSelectAll = () => {
    if (selectedUsers.length === availableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(availableUsers.map(user => user.id));
    }
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'select',
      label: t('addUsers.table.select'),
      width: '60px',
      render: user => {
        const alreadySaved = savedUsers.includes(user.id);
        return (
          <Checkbox
            checked={alreadySaved || selectedUsers.includes(user.id)}
            disabled={alreadySaved}
            onCheckedChange={() => handleUserToggle(user.id)}
            aria-label={`Selecionar ${user.name}`}
          />
        );
      },
    },
    {
      key: 'user',
      label: t('addUsers.table.user'),
      render: user => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              {user.avatar_url || user.thumbnail ? (
                <AvatarImage src={user.avatar_url || user.thumbnail} />
              ) : null}
              <AvatarFallback className="text-xs font-medium">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                user.availability,
              )}`}
            />
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {getStatusLabel(user.availability)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: t('addUsers.table.email'),
      render: user => <span className="text-muted-foreground">{user.email || '---'}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('addUsers.notFound.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('addUsers.notFound.description')}</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('addUsers.notFound.action')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BaseHeader
        title={t('addUsers.title', { name: team.name })}
        subtitle={t('addUsers.subtitle')}
        secondaryActions={[
          {
            label: t('actions.back'),
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: handleGoBack,
            variant: 'outline',
          },
        ]}
      />

      <div className="space-y-6">
        {/* Selection Summary */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('addUsers.summary', { selected: selectedUsers.length, total: users.length })}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={availableUsers.length === 0}
            >
              {selectedUsers.length === availableUsers.length
                ? t('actions.deselectAll')
                : t('actions.selectAll')}
            </Button>
          </div>
          <Button
            onClick={handleSaveUsers}
            disabled={selectedUsers.length === 0 || isSaving}
            className="min-w-[140px]"
          >
            {isSaving ? (
              t('actions.saving')
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('actions.addUsers')}
              </>
            )}
          </Button>
        </div>

        {/* Users Table */}
        <BaseTable
          data={users}
          columns={columns}
          loading={isLoading}
          emptyTitle={t('addUsers.empty.title')}
          emptyDescription={t('addUsers.empty.description')}
          emptyIcon={Users}
          getRowKey={user => user.id.toString()}
          className="border rounded-lg"
        />
      </div>
    </div>
  );
};

export default AddUsers;
