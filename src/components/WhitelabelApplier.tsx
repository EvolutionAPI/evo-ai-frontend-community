import { useApplyWhitelabel } from '@/hooks/useApplyWhitelabel';

/**
 * Componente que aplica configurações de whitelabel quando o tema muda
 * Deve ser usado dentro do DarkModeProvider e GlobalConfigProvider
 */
export function WhitelabelApplier() {
  useApplyWhitelabel();
  return null;
}

