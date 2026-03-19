import { ConversationFilter, ConversationListParams } from '@/types/chat/api';

/**
 * Converte filtros do modal para o formato da API do CRM Chat (POST /conversations/filter)
 */
export const convertFiltersToApiFormat = (filters: ConversationFilter[]): { filters: any[] } => {
  const filterArray: any[] = [];

  filters.forEach((filter, index) => {
    const { attribute_key, filter_operator, values } = filter;
    const query_operator = index === 0 ? null : 'AND'; // Primeiro filtro não tem operador, demais usam AND

    // Determinar se é custom attribute baseado no attribute_key
    const isCustomAttribute = [
      'browser_language',
      'conversation_language',
      'country_code',
      'referer',
      'mail_subject',
      'priority',
    ].includes(attribute_key);

    const filterItem: any = {
      attribute_key,
      filter_operator,
      values,
      query_operator,
    };

    // Adicionar custom_attribute_type se necessário
    if (isCustomAttribute) {
      if (attribute_key === 'priority') {
        // Priority é um custom attribute padrão
        filterItem.custom_attribute_type = 'conversation_attribute';
      } else {
        // Outros são additional_attributes
        filterItem.custom_attribute_type = '';
      }
    }

    filterArray.push(filterItem);
  });

  return { filters: filterArray };
};

/**
 * Converte filtros simples para parâmetros da URL (GET /conversations)
 */
export const convertFiltersToUrlParams = (
  filters: ConversationFilter[],
): ConversationListParams => {
  const params: ConversationListParams = {};

  filters.forEach(filter => {
    const { attribute_key, values } = filter;

    switch (attribute_key) {
      case 'status':
        if (values.length === 1) {
          params.status = values[0] as ConversationListParams['status'];
        }
        break;

      case 'assignee_id':
        if (values.length === 1) {
          const value = values[0];
          if (value === 'me') {
            params.assignee_type = 'me';
          } else if (value === 'unassigned') {
            params.assignee_type = 'unassigned';
          } else {
            params.assignee_id = value as string;
          }
        }
        break;

      case 'inbox_id':
        if (values.length === 1) {
          params.inbox_id = values[0] as string;
        }
        break;

      case 'team_id':
        if (values.length === 1) {
          params.team_id = values[0] as string;
        }
        break;

      case 'labels':
        if (values.length > 0) {
          params.labels = values as string[];
        }
        break;

      // case 'priority': // Não suportado pela API GET
      //   if (values.length === 1) {
      //     params.priority = values[0] as string;
      //   }
      //   break;
    }
  });

  return params;
};

/**
 * Determina se deve usar filtros avançados (POST) ou simples (GET)
 */
export const shouldUseAdvancedFilters = (filters: ConversationFilter[]): boolean => {
  // Se não há filtros, usar GET simples
  if (filters.length === 0) return false;

  // Verificar cada filtro individualmente
  return filters.some(filter => {
    const { attribute_key, filter_operator } = filter;

    // Operadores complexos que requerem POST
    const complexOperators = [
      'contains',
      'does_not_contain',
      'not_equal_to',
      'is_greater_than',
      'is_less_than',
      'days_before',
    ];

    // Campos complexos que sempre requerem POST
    const complexFields = [
      'created_at',
      'last_activity_at',
      'campaign_id',
      'priority',
      'pipeline_id',
      'browser_language',
      'conversation_language',
      'country_code',
      'referer',
      'mail_subject',
    ];

    // Se usa operador complexo
    if (complexOperators.includes(filter_operator)) {
      return true;
    }

    // Se usa campo complexo
    if (complexFields.includes(attribute_key)) {
      return true;
    }

    // Para labels, alguns operadores requerem POST
    if (
      attribute_key === 'labels' &&
      ['not_equal_to', 'is_present', 'is_not_present'].includes(filter_operator)
    ) {
      return true;
    }

    // Múltiplos valores no mesmo filtro simples podem usar GET se for apenas equal_to
    // Caso contrário, usar POST para maior flexibilidade
    if (filter.values.length > 1 && filter_operator !== 'equal_to') {
      return true;
    }

    return false;
  });
};

/**
 * Cria filtro de busca por texto
 */
export const createSearchFilter = (searchTerm: string): ConversationListParams => {
  return {
    q: searchTerm.trim(),
  };
};

/**
 * Combina parâmetros de busca com filtros
 */
export const combineSearchWithFilters = (
  searchParams: ConversationListParams,
  filterParams: ConversationListParams,
): ConversationListParams => {
  return {
    ...filterParams,
    ...searchParams,
  };
};
