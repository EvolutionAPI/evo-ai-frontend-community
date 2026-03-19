import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { integrationsService } from '@/services/integrations';
import { DashboardApp } from '@/types/integrations';
import { Skeleton } from '@evoapi/design-system';
import { AlertCircle } from 'lucide-react';

/**
 * Generic page component for displaying embedded dashboard apps
 * Follows system layout pattern with header and iframe content
 */
export default function DashboardAppPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage('integrations');

  const [app, setApp] = useState<DashboardApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApp() {
      if (!appId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await integrationsService.getDashboardApps();
        const foundApp = response.data.find(a => a.id === appId);

        if (!foundApp) {
          setError('Dashboard app not found');
          setLoading(false);
          return;
        }

        // Verify it's a sidebar type app
        if (foundApp.display_type !== 'sidebar') {
          setError('Invalid app type');
          setLoading(false);
          return;
        }

        setApp(foundApp);
      } catch (err) {
        console.error('Error loading dashboard app:', err);
        setError('Failed to load dashboard app');
      } finally {
        setLoading(false);
      }
    }

    loadApp();
  }, [appId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !app) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-destructive">
                {t('dashboardApps.page.error.title')}
              </h1>
              <p className="text-muted-foreground">
                {error || t('dashboardApps.page.error.notFound')}
              </p>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{t('dashboardApps.page.error.heading')}</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {t('dashboardApps.page.error.description')}
              </p>
            </div>
            <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline">
              {t('dashboardApps.page.error.goBack')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get the URL from app content
  const appUrl = Array.isArray(app.content)
    ? app.content[0]?.url
    : (app.content as { url?: string })?.url;

  if (!appUrl) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
          <h1 className="text-2xl font-bold tracking-tight text-destructive">
            {t('dashboardApps.page.error.invalidUrl')}
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
      </div>
    );
  }

  // Success - render app
  return (
    <div className="flex flex-col h-full">
      {/* Iframe Content */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          src={appUrl}
          title={app.title}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
