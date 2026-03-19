import { useState, useEffect } from 'react';
import { listMCPServers } from '@/services/agents';
import { MCPServer } from '@/types/ai';

export const useMCPServers = () => {
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMCPServers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const servers = await listMCPServers();
      setMcpServers(servers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar servidores MCP');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMCPServers();
  }, []);

  return {
    mcpServers,
    isLoading,
    error,
    refetch: loadMCPServers,
  };
};
