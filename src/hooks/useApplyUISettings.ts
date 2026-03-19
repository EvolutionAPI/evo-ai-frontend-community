import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook que aplica as configurações de UI do usuário (tamanho de fonte, etc.)
 * Deve ser usado no componente raiz da aplicação
 */
export function useApplyUISettings() {
  const { user } = useAuth();

  // Aplicar tamanho de fonte
  useEffect(() => {
    const fontSize = user?.ui_settings?.font_size || 'medium';

    const fontSizeMap: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };

    const fontSizeValue = fontSizeMap[fontSize] || '16px';
    document.body.style.fontSize = fontSizeValue;

  }, [user?.ui_settings?.font_size, user?.id]); // Adicionar user.id para garantir que reaplica quando user muda
}
