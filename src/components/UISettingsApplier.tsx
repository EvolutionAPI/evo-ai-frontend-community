import { useApplyUISettings } from '@/hooks/useApplyUISettings';

/**
 * Componente que aplica configurações de UI do usuário globalmente
 * Deve ser usado dentro do AuthProvider
 */
export function UISettingsApplier() {
  useApplyUISettings();
  return null;
}
