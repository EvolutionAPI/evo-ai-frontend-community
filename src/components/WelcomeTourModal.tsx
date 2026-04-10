import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map } from 'lucide-react';
import { Button } from '@evoapi/design-system/button';
import { tourRegistry } from '@/tours/tourRegistry';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';

const TOUR_ROUTE = '/channels';

export function WelcomeTourModal() {
  const { t } = useTranslation('tours');
  const tours = useAuthStore(state => state.tours);
  const markTourCompleted = useAuthStore(state => state.markTourCompleted);
  const markTourSkipped = useAuthStore(state => state.markTourSkipped);

  const [pendingTour, setPendingTour] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissed = !!tours['onboarding:welcome'];

  // Only start the tour after we have navigated to TOUR_ROUTE
  useEffect(() => {
    if (!pendingTour) return;
    if (pathname !== TOUR_ROUTE) return;

    timerRef.current = setTimeout(() => {
      tourRegistry.start(TOUR_ROUTE);
      setPendingTour(false);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pendingTour, pathname]);

  if (dismissed) return null;

  const handleDismiss = () => {
    markTourSkipped('onboarding:preference');
    markTourCompleted('onboarding:welcome');
  };

  const handleStartTour = () => {
    markTourCompleted('onboarding:preference');
    markTourCompleted('onboarding:welcome');
    navigate(TOUR_ROUTE);
    setPendingTour(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-6 text-center">
        <div
          className="flex items-center justify-center rounded-full w-16 h-16"
          style={{ backgroundColor: '#00C48C' }}
        >
          <Map className="h-8 w-8 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{t('welcome.title')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('welcome.description')}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={handleStartTour}
            className="w-full"
            style={{ backgroundColor: '#00C48C', color: '#fff' }}
          >
            {t('welcome.startButton')}
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="w-full text-muted-foreground">
            {t('welcome.skipButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
