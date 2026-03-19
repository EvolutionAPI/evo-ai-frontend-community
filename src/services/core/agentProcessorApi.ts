import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { applySetupInterceptor } from '@/services/core/setupInterceptor';

// Criar instância do axios específica para a API do Agent Processor
const agentProcessorApi = axios.create({
  baseURL: `${import.meta.env.VITE_AGENT_PROCESSOR_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar headers específicos para o Agent Processor
agentProcessorApi.interceptors.request.use(config => {
  // Adicionar token de autenticação
  const authHeader = useAuthStore.getState().getAuthHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader.Authorization;
  }

  return config;
});

// Interceptador para tratar respostas e erros
agentProcessorApi.interceptors.response.use(
  response => response,
  error => {
    const detail =
      error?.response?.data?.error?.message ||
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      'Unknown error';
    console.error('Agent Processor API Error:', detail, { status: error?.response?.status });
    return Promise.reject(error);
  },
);

applySetupInterceptor(agentProcessorApi);

export { agentProcessorApi };
export default agentProcessorApi;
