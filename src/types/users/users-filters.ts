import { BaseFilter, FilterType, OPERATOR_TYPES_1, OPERATOR_TYPES_3, OPERATOR_TYPES_5 } from '@/types/core';


// Tipos de filtro para usuários
export const USER_FILTER_TYPES: FilterType[] = [
  {
    attributeKey: 'name',
    attributeI18nKey: 'Nome',
    inputType: 'plain_text',
    dataType: 'text',
    filterOperators: OPERATOR_TYPES_3,
    attribute_type: 'standard',
  },
  {
    attributeKey: 'email',
    attributeI18nKey: 'Email',
    inputType: 'plain_text',
    dataType: 'text',
    filterOperators: OPERATOR_TYPES_3,
    attribute_type: 'standard',
  },
  {
    attributeKey: 'role',
    attributeI18nKey: 'Função',
    inputType: 'search_select',
    dataType: 'text',
    filterOperators: OPERATOR_TYPES_1,
    attribute_type: 'standard',
    options: [
      { label: 'Administrador', value: 'administrator' },
      { label: 'Agente', value: 'agent' },
    ],
  },
  {
    attributeKey: 'availability_status',
    attributeI18nKey: 'Disponibilidade',
    inputType: 'search_select',
    dataType: 'text',
    filterOperators: OPERATOR_TYPES_1,
    attribute_type: 'standard',
    options: [
      { label: 'Online', value: 'online' },
      { label: 'Ocupado', value: 'busy' },
      { label: 'Offline', value: 'offline' },
    ],
  },
  {
    attributeKey: 'confirmed',
    attributeI18nKey: 'Status de Confirmação',
    inputType: 'search_select',
    dataType: 'text',
    filterOperators: OPERATOR_TYPES_1,
    attribute_type: 'standard',
    options: [
      { label: 'Confirmado', value: 'true' },
      { label: 'Pendente', value: 'false' },
    ],
  },
  {
    attributeKey: 'created_at',
    attributeI18nKey: 'Data de Criação',
    inputType: 'date',
    dataType: 'date',
    filterOperators: OPERATOR_TYPES_5,
    attribute_type: 'standard',
  },
];

// Filtro padrão para usuários
export const DEFAULT_USER_FILTER: BaseFilter = {
  attributeKey: 'name',
  filterOperator: 'equal_to',
  values: '',
  queryOperator: 'and',
  attributeModel: 'standard',
};
