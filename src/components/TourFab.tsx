import { useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@evoapi/design-system';
import { tourRegistry, matchTourRoute } from '@/tours/tourRegistry';

export function TourFab() {
  const snapshot = useSyncExternalStore(
    tourRegistry.subscribe,
    tourRegistry.getSnapshot,
  );
  const { pathname } = useLocation();
  const matchedRoute = matchTourRoute(pathname, snapshot);

  if (!matchedRoute) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => tourRegistry.start(matchedRoute)}
          aria-label="Ver tour desta página"
          className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer"
        >
          <Navigation className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Ver tour desta página</p>
      </TooltipContent>
    </Tooltip>
  );
}
