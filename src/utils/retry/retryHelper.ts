/**
 * Helper para retry automático de operações que podem falhar
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Se é o último attempt, não fazer retry
      if (attempt === maxRetries) {
        break;
      }

      // Verificar se é um erro que vale a pena tentar novamente
      if (!isRetriableError(error)) {
        break;
      }

      // Esperar antes de tentar novamente (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

/**
 * Verifica se um erro é passível de retry
 */
function isRetriableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Erros de rede geralmente são retryáveis
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return true;
    }
  }

  // Se tem status HTTP, verificar códigos específicos
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    // 5xx são erros do servidor que podem ser temporários
    // 429 é rate limiting
    return status >= 500 || status === 429;
  }

  return false;
}
