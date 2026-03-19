import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TeamsService from '@/services/teams/teamsService';
import UsersService from '@/services/users/usersService';
import { labelsService } from '@/services/contacts/labelsService';

interface MacroFormDataOptions {
  agents: Array<{ id: string; name: string; email?: string }>;
  teams: Array<{ id: string; name: string; description?: string }>;
  labels: Array<{ id: string; title: string; color: string }>;
  inboxes: any[];
  campaigns: any[];
}

export const useMacroFormData = () => {
  const { user } = useAuth();

  const [options, setOptions] = useState<MacroFormDataOptions>({
    agents: [],
    teams: [],
    labels: [],
    inboxes: [],
    campaigns: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFormData = async () => {
    if (!(user?.account as any).id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [teamsData, usersData, labelsData] = await Promise.allSettled([
        TeamsService.getTeams(),
        UsersService.getUsers(),
        labelsService.getLabels(),
      ]);

      const newOptions: MacroFormDataOptions = {
        agents: [],
        teams: [],
        labels: [],
        inboxes: [],
        campaigns: [],
      };

      // Processar teams
      if (teamsData.status === 'fulfilled') {
        if (Array.isArray(teamsData.value)) {
          newOptions.teams = teamsData.value.map(team => ({
            id: team.id,
            name: team.name,
            description: team.description,
          }));
        }
      }

      // Processar users/agents
      if (usersData.status === 'fulfilled') {
        const users = usersData.value.data || usersData.value;
        if (Array.isArray(users)) {
          newOptions.agents = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
          }));
        }
      }

      // Processar labels
      if (labelsData.status === 'fulfilled') {
        const labels = labelsData.value.data || labelsData.value;
        if (Array.isArray(labels)) {
          newOptions.labels = labels.map(label => ({
            id: label.id,
            title: label.title,
            color: label.color,
          }));
        }
      }

      setOptions(newOptions);
    } catch (err) {
      console.error('Erro ao carregar dados do formulário de macro:', err);
      setError('Erro ao carregar dados do formulário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Aguardar o usuário estar carregado
    if (user && (user.account as any).id) {
      loadFormData();
    } else if (user === null) {
      // Keep loading as true, user is still being loaded
    } else if (user && !(user.account as any).id) {
      setLoading(false);
    }
  }, [user]);

  return {
    options,
    loading,
    error,
    refetch: loadFormData,
  };
};
