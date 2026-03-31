import axios from 'axios';

const authBaseURL =
  import.meta.env.VITE_AUTH_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001';

const setupApi = axios.create({
  baseURL: authBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

export interface SetupStatus {
  status: 'active' | 'inactive';
  instance_id: string | null;
  api_key?: string;
}

export interface BootstrapPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const setupService = {
  async getStatus(): Promise<SetupStatus> {
    const { data } = await setupApi.get<SetupStatus>('/setup/status');
    return data;
  },

  async bootstrap(payload: BootstrapPayload): Promise<{ status: string; message: string }> {
    const { data } = await setupApi.post('/setup/bootstrap', payload);
    return data;
  },
};
