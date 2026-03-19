import { useState, useMemo } from 'react';
import { Agent } from '@/types/agents';

interface FilterState {
  types: string[];
  hasModel: boolean | null;
  isShared: boolean | null;
  hasFolder: boolean | null;
}

interface UseAgentFiltersProps {
  agents: Agent[];
  initialFilters?: Partial<FilterState>;
}

export const useAgentFilters = ({ agents, initialFilters = {} }: UseAgentFiltersProps) => {
  // Estado dos filtros
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    hasModel: null,
    isShared: null,
    hasFolder: null,
    ...initialFilters,
  });

  // Estado da busca
  const [searchTerm, setSearchTerm] = useState('');

  // Aplicar filtros e busca
  const filteredAgents = useMemo(() => {
    let filtered = [...agents];

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        agent =>
          agent.name.toLowerCase().includes(search) ||
          agent.description?.toLowerCase().includes(search) ||
          agent.type.toLowerCase().includes(search) ||
          agent.model?.toLowerCase().includes(search),
      );
    }

    // Filtro por tipos
    if (filters.types.length > 0) {
      filtered = filtered.filter(agent => filters.types.includes(agent.type));
    }

    // Filtro por modelo
    if (filters.hasModel !== null) {
      filtered = filtered.filter(agent => (filters.hasModel ? !!agent.model : !agent.model));
    }

    // Filtro por compartilhamento
    if (filters.isShared !== null) {
      filtered = filtered.filter(agent =>
        filters.isShared ? !!agent.is_shared : !agent.is_shared,
      );
    }

    // Filtro por pasta
    if (filters.hasFolder !== null) {
      filtered = filtered.filter(agent =>
        filters.hasFolder ? !!agent.folder_id : !agent.folder_id,
      );
    }

    return filtered;
  }, [agents, filters, searchTerm]);

  // Estatísticas dos filtros
  const filterStats = useMemo(() => {
    const totalAgents = agents.length;
    const filteredCount = filteredAgents.length;
    const hasActiveFilters =
      searchTerm.trim() !== '' ||
      filters.types.length > 0 ||
      filters.hasModel !== null ||
      filters.isShared !== null ||
      filters.hasFolder !== null;

    return {
      totalAgents,
      filteredCount,
      hasActiveFilters,
      hiddenCount: totalAgents - filteredCount,
    };
  }, [agents.length, filteredAgents.length, filters, searchTerm]);

  // Métodos para atualizar filtros
  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      hasModel: null,
      isShared: null,
      hasFolder: null,
    });
    setSearchTerm('');
  };

  const toggleTypeFilter = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];

    setFilters({ ...filters, types: newTypes });
  };

  const setBooleanFilter = (key: keyof FilterState, value: boolean | null) => {
    setFilters({ ...filters, [key]: value });
  };

  // Métodos para busca
  const updateSearchTerm = (term: string) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    // Estado
    filters,
    searchTerm,
    filteredAgents,
    filterStats,

    // Métodos de filtros
    updateFilters,
    clearFilters,
    toggleTypeFilter,
    setBooleanFilter,

    // Métodos de busca
    updateSearchTerm,
    clearSearch,

    // Estados derivados
    hasActiveFilters: filterStats.hasActiveFilters,
    isEmpty: filteredAgents.length === 0,
    isSearching: searchTerm.trim() !== '',
    isFiltering:
      filters.types.length > 0 ||
      filters.hasModel !== null ||
      filters.isShared !== null ||
      filters.hasFolder !== null,
  };
};
