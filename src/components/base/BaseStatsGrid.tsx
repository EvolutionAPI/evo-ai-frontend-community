import BaseStatsCard, { BaseStatsCardProps } from './BaseStatsCard';
import { cn } from '@/lib/utils';

export interface BaseStatsGridProps {
  /** Array de configurações dos cards */
  cards: BaseStatsCardProps[];
  /** Número de colunas no grid */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Espaçamento entre cards */
  gap?: 'sm' | 'md' | 'lg';
  /** Classe CSS adicional */
  className?: string;
  /** Se deve ser responsivo */
  responsive?: boolean;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
};

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export default function BaseStatsGrid({
  cards,
  columns = 4,
  gap = 'md',
  className,
  responsive = true,
}: BaseStatsGridProps) {
  // Filtrar apenas cards que devem ser mostrados
  const visibleCards = cards.filter(card => card.show !== false);

  if (visibleCards.length === 0) {
    return null;
  }

  // Determinar número de colunas baseado no número de cards se for responsivo
  const actualColumns = responsive && visibleCards.length < columns 
    ? Math.min(visibleCards.length, 4) as keyof typeof columnClasses
    : columns;

  return (
    <div className={cn(
      "grid mb-6",
      columnClasses[actualColumns],
      gapClasses[gap],
      className
    )}>
      {visibleCards.map((cardProps, index) => (
        <BaseStatsCard
          key={`stats-card-${index}`}
          {...cardProps}
        />
      ))}
    </div>
  );
}