import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SmartRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirecionar para conversas (página principal do Evolution)
  return <Navigate to="/conversations" replace />;
};

export default SmartRedirect;
