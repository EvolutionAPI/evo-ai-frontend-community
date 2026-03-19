import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerRouteProps {
  children: ReactNode;
}

const CustomerRoute = ({ children }: CustomerRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Permitir acesso se autenticado
  return <>{children}</>;
};

export default CustomerRoute;
