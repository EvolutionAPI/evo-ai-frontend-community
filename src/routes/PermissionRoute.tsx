import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionsContext';

interface PermissionRouteProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  permissions?: string[]; // Array de permissões alternativo
  requireAll?: boolean; // Se true, requer todas as permissões
  redirectTo?: string; // Rota para redirecionar se não tiver permissão
  fallback?: React.ReactNode; // Componente alternativo
}

/**
 * Componente que protege rotas baseado em permissões específicas
 * Deve ser usado dentro da definição de rotas do React Router
 *
 * Exemplos de uso:
 *
 * // Rota que precisa de permissão específica
 * <PermissionRoute resource="users" action="read">
 *   <UsersPage />
 * </PermissionRoute>
 *
 * // Rota com múltiplas permissões
 * <PermissionRoute permissions={['users.read', 'teams.read']} requireAll={false}>
 *   <DashboardPage />
 * </PermissionRoute>
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  resource,
  action,
  permissions,
  requireAll = false,
  redirectTo = '/unauthorized',
  fallback = null,
}) => {
  const navigate = useNavigate();
  const { can, canAny, canAll, isReady, loading } = usePermissions();

  // Memoizar verificações de permissão para evitar recálculos desnecessários
  const permissionCheck = useMemo(() => {
    if (loading || !isReady) {
      return { hasAccess: false, shouldRedirect: false, isLoading: true };
    }

    // Verificar permissões específicas
    let hasPermission = false;

    if (permissions && permissions.length > 0) {
      // Usar array de permissões
      hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
    } else if (resource && action) {
      // Usar resource.action
      hasPermission = can(resource, action);
    } else {
      // Se não há permissões específicas, permitir acesso para usuários autenticados
      hasPermission = true;
    }

    return {
      hasAccess: hasPermission,
      shouldRedirect: !hasPermission && !fallback,
      isLoading: false
    };
  }, [can, canAny, canAll, permissions, requireAll, resource, action, fallback, loading, isReady]);

  // Usar useEffect para navegação para evitar chamadas durante render
  useEffect(() => {
    if (permissionCheck.shouldRedirect) {
      navigate(redirectTo, { replace: true });
    }
  }, [permissionCheck.shouldRedirect, navigate, redirectTo]);

  // Mostrar loading enquanto carrega permissões
  if (permissionCheck.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Renderização baseada nas verificações
  if (!permissionCheck.hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Se deve redirecionar, não renderizar nada enquanto navega
    if (permissionCheck.shouldRedirect) {
      return null;
    }
  }

  // Usuário tem permissão, renderizar conteúdo
  return <>{children}</>;
};

export default PermissionRoute;
