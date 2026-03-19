'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@evoapi/design-system';
import { UserX } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ImpersonationBar() {
  const { t } = useLanguage('common');
  
  // Usar authStore para verificar impersonation (memória)
  const impersonation = useAuthStore(state => state.impersonation);
  const exitImpersonation = useAuthStore(state => state.exitImpersonation);

  const handleExitImpersonation = () => {
    // Restaurar dados do admin via authStore
    exitImpersonation();
    
    // Recarregar a página para aplicar as mudanças
    window.location.reload();
  };

  // Se não está impersonando, não renderizar
  if (!impersonation) return null;

  return (
    <div className="bg-green-400 text-black py-2 px-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <p>
          {t('base.impersonation.viewing')} <span className="font-bold">{impersonation.impersonatedClient}</span>
        </p>
        <Button
          onClick={handleExitImpersonation}
          className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
          size="sm"
        >
          <UserX className="h-4 w-4" />
          {t('base.impersonation.exit')}
        </Button>
      </div>
    </div>
  );
}
