import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from '@evoapi/design-system';
import { Activity, Loader2, BarChart3, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import ContactEventsTimeline from './ContactEventsTimeline';
import { useContactEvents } from '@/hooks/useContactEvents';
import type { Contact } from '@/types/contacts';

interface ContactEventsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}

export default function ContactEventsModal({ open, onOpenChange, contact }: ContactEventsModalProps) {

  const { t } = useLanguage('contacts');
  const { stats, loading, pagination, loadContactEvents, loadContactEventStats } = useContactEvents();

  const [statsExpanded, setStatsExpanded] = React.useState(false);

  // Carregar eventos e estatísticas quando o modal abrir
  React.useEffect(() => {
    if (open && contact?.id) {
      loadContactEvents(contact.id, { page: 1, limit: 30 });
      loadContactEventStats(contact.id, 30);
    }
  }, [open, contact?.id, loadContactEvents, loadContactEventStats]);

  if (!contact) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {t('events.title', { name: contact.name })}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('events.subtitle')}
              </p>
            </div>
          </div>

          {/* Event Statistics Section - Collapsible */}
          <div className="mt-4 pt-4 border-t border-border">
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
              onClick={() => setStatsExpanded(!statsExpanded)}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BarChart3 className="h-4 w-4" />
                {t('events.stats.title')}
                {pagination && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {pagination.totalItems || 0} {t('events.stats.events')}
                  </Badge>
                )}
              </div>
              {statsExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {statsExpanded && (
              <div className="mt-3 pl-6">
                {loading.stats ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{t('events.stats.loading')}</span>
                  </div>
                ) : stats ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Total de Eventos */}
                      <div className="flex flex-col items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">{t('events.stats.total')}</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{stats.totalEvents || 0}</span>
                        <span className="text-xs text-muted-foreground">{t('events.stats.events')}</span>
                      </div>

                      {/* Primeira Atividade */}
                      <div className="flex flex-col items-center p-3 bg-success/5 rounded-lg border border-success/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-success" />
                          <span className="text-xs font-medium text-success">{t('events.stats.first')}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {stats.firstEvent ? new Date(stats.firstEvent).toLocaleDateString('pt-BR') : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">{t('events.stats.event')}</span>
                      </div>

                      {/* Última Atividade */}
                      <div className="flex flex-col items-center p-3 bg-warning/5 rounded-lg border border-warning/10">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-warning" />
                          <span className="text-xs font-medium text-warning">{t('events.stats.last')}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {stats.lastEvent ? new Date(stats.lastEvent).toLocaleDateString('pt-BR') : '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">{t('events.stats.event')}</span>
                      </div>
                    </div>

                    {/* Eventos por Tipo */}
                    {stats?.eventsByType && Object.keys(stats.eventsByType).length > 0 && (
                      <div className="mt-4">
                        <span className="text-xs font-medium text-muted-foreground mb-2 block">
                          {t('events.stats.byType')}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stats.eventsByType).map(([type, count]) => (
                            <Badge
                              key={type}
                              variant="outline"
                              className="text-xs"
                            >
                              {type}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t('events.stats.empty')}
                  </span>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ContactEventsTimeline
            contactId={contact.id}
            showHeader={false}
            maxHeight="calc(90vh - 120px)"
            initialLimit={30}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
