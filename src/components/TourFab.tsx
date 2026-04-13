import { useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { CircleHelp } from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@evoapi/design-system';
import { tourRegistry, matchTourRoute } from '@/tours/tourRegistry';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';

export function TourFab() {
  const { t } = useTranslation('tours');
  const snapshot = useSyncExternalStore(
    tourRegistry.subscribe,
    tourRegistry.getSnapshot,
  );
  const { pathname } = useLocation();
  const tours = useAuthStore(state => state.tours);
  const matchedRoute = matchTourRoute(pathname, snapshot);

  if (!matchedRoute) return null;

  const tourKey = matchedRoute.slice(1);
  const tourSeen = tours[tourKey] === 'completed' || tours[tourKey] === 'skipped';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => tourRegistry.start(matchedRoute)}
          aria-label={t('viewPageTour')}
          data-tour="nav-tour-icon"
          className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer"
        >
          <CircleHelp className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      {tourSeen && (
        <TooltipContent>
          <p>{t('viewPageTour')}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
