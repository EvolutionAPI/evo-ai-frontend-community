import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { markBootstrapPhaseEnd, markBootstrapPhaseStart } from '@/utils/requestMonitor';

interface RouterGuardProps {
  children: React.ReactNode;
}

/**
 * Rotas especiais que precisam de validação no RouterGuard
 * Outras validações de permissão são feitas pelos componentes PermissionRoute nas rotas
 */
const SPECIAL_ROUTES = {
  PUBLIC_ROUTES: ['/auth', '/login', '/register', '/widget'],
  ONBOARDING_ROUTES: ['/onboarding'],
};

/**
 * Redireciona para a rota padrão baseada no tipo de usuário
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDefaultRoute = (user: any): string => {
  if (!user || !user.accounts || user.accounts.length === 0) {
    return '/onboarding/create-account';
  }

  return '/conversations';
};

const RouterGuard: React.FC<RouterGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useAuthStore();
  const { user, isAuthenticated, logout } = useAuth();
  const { isReady: permissionsReady } = usePermissions();

  useEffect(() => {
    const handleSetupRequired = async () => {
      if (isAuthenticated) {
        await logout();
      }
      navigate('/login', { replace: true });
    };

    window.addEventListener('setup:required', handleSetupRequired);
    return () => window.removeEventListener('setup:required', handleSetupRequired);
  }, [isAuthenticated, logout, navigate]);

  useEffect(() => {
    markBootstrapPhaseStart('router-guard');

    const checkAuth = async () => {
      // Skip auth check for public routes
      const isPublicRoute = SPECIAL_ROUTES.PUBLIC_ROUTES.some(route =>
        location.pathname.startsWith(route)
      );

      // Allow onboarding routes for authenticated users without accounts
      const isOnboardingRoute = SPECIAL_ROUTES.ONBOARDING_ROUTES.some(route =>
        location.pathname.startsWith(route)
      );

      if (isPublicRoute) {
        // If user is already authenticated and trying to access auth pages, redirect
        // EXCEPT when there are OAuth parameters (oauth_url or return_to) or accessing widget
        // ALSO EXCEPT when user doesn't have accounts - they should go to onboarding
        // IMPORTANT: Only redirect if user is fully loaded to avoid loops
        if (isAuthenticated && user && location.pathname !== '/widget' && !isLoading) {
          const urlParams = new URLSearchParams(location.search);
          const hasOAuthParams = urlParams.has('oauth_url') || urlParams.has('return_to');

          const isAuthConfirmationRoute = location.pathname.startsWith('/auth/confirmation');

          if (!hasOAuthParams && !isAuthConfirmationRoute) {
            // If user doesn't have accounts, redirect to onboarding instead of default route
            // This prevents loops when user is already on onboarding route
            if (!user.accounts || user.accounts.length === 0) {
              if (!isOnboardingRoute) {
                navigate('/onboarding/create-account', { replace: true });
              }
            } else {
              // Prevent redirect loop - check if we're already on the default route
              const defaultRoute = getDefaultRoute(user);
              if (location.pathname !== defaultRoute) {
                navigate(defaultRoute, { replace: true });
              }
            }
          }
        }
        return;
      }

      // For onboarding routes, only require authentication
      if (isOnboardingRoute) {
        if (!isAuthenticated || !user) {
          navigate('/login', {
            state: { from: location },
            replace: true,
          });
        }
        return;
      }

      // For protected routes, validate authentication
      if (!isLoading) {
        if (!isAuthenticated || !user) {
          // Redirect to login if not authenticated
          navigate('/login', {
            state: { from: location },
            replace: true,
          });
          return;
        }

        // Aguardar o carregamento das permissões antes de validar rotas protegidas
        // Isso evita redirecionamentos prematuros ou verificações incorretas
        if (!permissionsReady) {
          markBootstrapPhaseEnd('router-guard', { stage: 'waiting_permissions', path: location.pathname });
          return;
        }

        // Skip periodic token validation here to avoid loops
        // The AuthContext already handles periodic validation
      }
    };

    checkAuth();
    if (!isLoading && (!isAuthenticated || permissionsReady)) {
      markBootstrapPhaseEnd('router-guard', {
        stage: 'ready',
        path: location.pathname,
        authenticated: isAuthenticated,
      });
    }
  }, [location, isAuthenticated, user, isLoading, permissionsReady, navigate]);

  // Show loading spinner while checking auth or loading permissions
  const isCurrentPathPublicOrOnboarding = [
    ...SPECIAL_ROUTES.PUBLIC_ROUTES,
    ...SPECIAL_ROUTES.ONBOARDING_ROUTES,
  ].some(route => location.pathname.startsWith(route));

  if (isLoading || (!isCurrentPathPublicOrOnboarding && isAuthenticated && !permissionsReady)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouterGuard;
