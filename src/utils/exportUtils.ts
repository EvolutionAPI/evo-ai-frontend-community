/**
 * Exporta dados como arquivo JSON para download
 * @param data Os dados para exportar
 * @param filename O nome do arquivo (sem extensão .json)
 * @param pretty Se deve formatar o JSON de forma legível
 * @returns boolean indicando sucesso
 */
export function exportAsJson(
  data: Record<string, unknown>,
  filename: string,
  pretty: boolean = true,
): boolean {
  try {
    // Criar uma cópia dos dados para evitar modificações no original
    const exportData = JSON.parse(JSON.stringify(data));

    // Remover campos sensíveis dos agentes
    if (exportData.agents && Array.isArray(exportData.agents)) {
      exportData.agents = exportData.agents.map((agent: Record<string, unknown>) => {
        const cleanAgent = { ...agent };

        // Remover campos sensíveis
        delete cleanAgent.api_key_id;
        delete cleanAgent.folder_id;
        delete cleanAgent.client_id;
        delete cleanAgent.created_at;
        delete cleanAgent.updated_at;

        return cleanAgent;
      });
    }

    // Converter para JSON
    const jsonContent = pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);

    // Criar blob e fazer download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar a URL do objeto
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Erro ao exportar JSON:', error);
    return false;
  }
}

/**
 * Gera nome de arquivo com data atual
 * @param prefix Prefixo do nome do arquivo
 * @returns Nome do arquivo com data
 */
export function generateExportFilename(prefix: string): string {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  return `${prefix}-${formattedDate}`;
}
