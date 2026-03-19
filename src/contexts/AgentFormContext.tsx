import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AgentCreate } from '@/types/agents';

// Interface para o estado do formulário
export interface AgentFormState {
  data: Partial<AgentCreate>;
  originalData: Partial<AgentCreate>;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  currentStep: number;
  totalSteps: number;
}

// Interface para as ações do formulário
export type AgentFormAction =
  | { type: 'SET_DATA'; payload: Partial<AgentCreate> }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: unknown } }
  | { type: 'UPDATE_CONFIG'; payload: { field: string; value: unknown } }
  | { type: 'SET_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET_FORM'; payload?: Partial<AgentCreate> }
  | { type: 'SET_ORIGINAL_DATA'; payload: Partial<AgentCreate> };

// Estado inicial do formulário
const initialState: AgentFormState = {
  data: {
    name: '',
    description: '',
    type: 'llm',
    model: '',
    config: {
      tools: [],
      mcp_servers: [],
      agent_tools: [],
      output_schema: {},
    },
  },
  originalData: {},
  isDirty: false,
  isValid: false,
  errors: {},
  isSubmitting: false,
  currentStep: 0,
  totalSteps: 3, // BasicInfo, Configuration, SubAgents
};

// Função para verificar se os dados são válidos
const validateFormData = (data: Partial<AgentCreate>): boolean => {
  // Validações básicas obrigatórias
  return !!(
    data.name &&
    data.name.trim().length > 0 &&
    data.description &&
    data.description.trim().length > 0 &&
    data.type
  );
};

// Função para verificar se o formulário foi modificado
const checkIsDirty = (current: Partial<AgentCreate>, original: Partial<AgentCreate>): boolean => {
  return JSON.stringify(current) !== JSON.stringify(original);
};

// Reducer para gerenciar o estado do formulário
const agentFormReducer = (state: AgentFormState, action: AgentFormAction): AgentFormState => {
  switch (action.type) {
    case 'SET_DATA': {
      const newData = action.payload;
      return {
        ...state,
        data: newData,
        isDirty: checkIsDirty(newData, state.originalData),
        isValid: validateFormData(newData),
      };
    }

    case 'UPDATE_FIELD': {
      const newData = {
        ...state.data,
        [action.payload.field]: action.payload.value,
      };
      return {
        ...state,
        data: newData,
        isDirty: checkIsDirty(newData, state.originalData),
        isValid: validateFormData(newData),
      };
    }

    case 'UPDATE_CONFIG': {
      const newData = {
        ...state.data,
        config: {
          ...state.data.config,
          [action.payload.field]: action.payload.value,
        },
      };
      return {
        ...state,
        data: newData,
        isDirty: checkIsDirty(newData, state.originalData),
        isValid: validateFormData(newData),
      };
    }

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.error,
        },
      };

    case 'CLEAR_ERROR': {
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors,
      };
    }

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.payload, state.totalSteps - 1)),
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    case 'RESET_FORM': {
      const resetData = action.payload || initialState.data;
      return {
        ...initialState,
        data: resetData,
        originalData: resetData,
      };
    }

    case 'SET_ORIGINAL_DATA':
      return {
        ...state,
        originalData: action.payload,
        isDirty: checkIsDirty(state.data, action.payload),
      };

    default:
      return state;
  }
};

// Interface para o contexto
interface AgentFormContextType {
  state: AgentFormState;
  dispatch: React.Dispatch<AgentFormAction>;
  // Métodos auxiliares
  updateField: (field: string, value: unknown) => void;
  updateConfig: (field: string, value: unknown) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: (data?: Partial<AgentCreate>) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  canProceedToNextStep: () => boolean;
}

// Criação do contexto
const AgentFormContext = createContext<AgentFormContextType | undefined>(undefined);

// Provider do contexto
interface AgentFormProviderProps {
  children: ReactNode;
  initialData?: Partial<AgentCreate>;
}

export const AgentFormProvider: React.FC<AgentFormProviderProps> = ({ children, initialData }) => {
  const [state, dispatch] = useReducer(agentFormReducer, {
    ...initialState,
    data: initialData || initialState.data,
    originalData: initialData || initialState.data,
  });

  // Métodos auxiliares
  const updateField = (field: string, value: unknown) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };

  const updateConfig = (field: string, value: unknown) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: { field, value } });
  };

  const setError = (field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, error } });
  };

  const clearError = (field: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: field });
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const prevStep = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const resetForm = (data?: Partial<AgentCreate>) => {
    dispatch({ type: 'RESET_FORM', payload: data });
  };

  const setSubmitting = (isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
  };

  // Verificar se pode prosseguir para o próximo step
  const canProceedToNextStep = (): boolean => {
    const { currentStep, data, errors } = state;

    // Verificar se há erros no step atual
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return false;

    switch (currentStep) {
      case 0: // BasicInfo
        return !!(data.name && data.description && data.type);
      case 1: // Configuration
        return !!(data.type === 'llm' ? data.model : true);
      case 2: // SubAgents
        return true; // SubAgents é opcional
      default:
        return true;
    }
  };

  const contextValue: AgentFormContextType = {
    state,
    dispatch,
    updateField,
    updateConfig,
    setError,
    clearError,
    nextStep,
    prevStep,
    resetForm,
    setSubmitting,
    canProceedToNextStep,
  };

  return <AgentFormContext.Provider value={contextValue}>{children}</AgentFormContext.Provider>;
};

// Hook personalizado para usar o contexto
export const useAgentForm = (): AgentFormContextType => {
  const context = useContext(AgentFormContext);
  if (!context) {
    throw new Error('useAgentForm deve ser usado dentro de um AgentFormProvider');
  }
  return context;
};
