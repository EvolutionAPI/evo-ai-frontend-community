import { useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const useAccountId = (): string | null => {
  const { accountId } = useParams<{ accountId: string }>();
  const location = useLocation();
  const { currentAccountId, currentUser } = useAuthStore.getState();

  // Primeira tentativa: pegar do parâmetro da rota
  if (accountId) {
    // 🔒 VALIDATION: Verificar se o accountId da URL está disponível para o usuário
    if (currentUser?.accounts && !currentUser.accounts.some(acc => acc.id === accountId)) {
      console.warn(`AccountId ${accountId} da URL não está disponível para o usuário. Ignorando.`);
      // Não retornar accountId inválido - continuar para outras tentativas
    } else {
      return accountId;
    }
  }

  // Segunda tentativa: extrair da URL usando regex (suporta UUIDs e números)
  const match = location.pathname.match(/\/accounts\/([a-f0-9-]+|\d+)/);
  if (match) {
    const urlAccountId = match[1];
    // 🔒 VALIDATION: Verificar se o accountId da URL está disponível para o usuário
    if (currentUser?.accounts && !currentUser.accounts.some(acc => acc.id === urlAccountId)) {
      console.warn(`AccountId ${urlAccountId} da URL não está disponível para o usuário. Ignorando.`);
      // Não retornar accountId inválido - continuar para outras tentativas
    } else {
      return urlAccountId;
    }
  }

  // 🔒 VALIDATION: Verificar se o currentAccountId do store está disponível para o usuário
  if (currentAccountId) {
    if (currentUser?.accounts && !currentUser.accounts.some(acc => acc.id === currentAccountId)) {
      console.warn(`AccountId ${currentAccountId} do store não está disponível para o usuário. Limpando.`);
      // Limpar accountId inválido do store
      useAuthStore.getState().setCurrentAccountId(null);
      localStorage.removeItem('currentAccountId');
      // Continuar para outras tentativas
    } else {
      return currentAccountId;
    }
  }

  // Tentar pegar do user data
  if (currentUser) {
    if (currentUser.account_id) {
      return String(currentUser.account_id);
    }

    // Try to get from accounts array
    if (currentUser.accounts && currentUser.accounts.length > 0) {
      return String(currentUser.accounts[0].id);
    }
  }

  return null;
};
