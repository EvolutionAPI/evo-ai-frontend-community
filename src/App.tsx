import { useEffect } from 'react';
import AppRouter from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/ThemeContext';
import ImpersonationBar from './components/ImpersonationBar';
import AppInitializer from './components/AppInitializer';
import { GlobalConfigProvider } from './contexts/GlobalConfigContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { UISettingsApplier } from './components/UISettingsApplier';
import { unlockAudioContext } from '@/utils/audioNotificationUtils';

import { Toaster } from '@evoapi/design-system';

import { useIsDarkClass } from '@/hooks/chat/useIsDarkClass';

// Componente wrapper para o Toaster que usa o contexto de tema
function ThemedToaster() {
  const isDark = useIsDarkClass();

  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={2000}
      theme={isDark ? 'dark' : 'light'}
    />
  );
}

function App() {
  useEffect(() => {
    const unlock = () => unlockAudioContext();
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <GlobalConfigProvider>
          <UISettingsApplier />
          <PermissionsProvider>
          <NotificationsProvider>
            <AppInitializer>
              <ImpersonationBar />
              <AppRouter />
              <ThemedToaster />
            </AppInitializer>
          </NotificationsProvider>
          </PermissionsProvider>
        </GlobalConfigProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
