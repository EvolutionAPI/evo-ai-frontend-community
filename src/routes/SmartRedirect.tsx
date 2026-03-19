import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SmartRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não tem contas, redirecionar para onboarding
  if (!user.accounts || user.accounts.length === 0) {
    return <Navigate to="/onboarding/create-account" replace />;
  }

  // Se tem contas, redirecionar para conversas (página principal do Evolution)
  return <Navigate to="/conversations" replace />;
};

export default SmartRedirect;
