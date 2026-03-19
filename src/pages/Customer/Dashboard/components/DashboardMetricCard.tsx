import type { LucideIcon } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@evoapi/design-system';

type CardTone = 'good' | 'warning' | 'critical' | 'neutral';

type CardImportance = 'primary' | 'secondary';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentClassName: string;
  importance?: CardImportance;
  status?: {
    label: string;
    tone: CardTone;
  };
}

const toneClasses: Record<CardTone, string> = {
  good: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  neutral: 'bg-muted text-muted-foreground border-border',
};

const DashboardMetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentClassName,
  importance = 'secondary',
  status,
}: DashboardMetricCardProps) => {
  const valueClassName = importance === 'primary' ? 'text-3xl font-semibold' : 'text-2xl font-semibold';

  return (
    <Card className={importance === 'primary' ? 'border-primary/30 bg-primary/[0.03] h-full' : 'h-full'}>
      <CardHeader className="flex flex-row items-start justify-between pb-2 gap-3">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium text-muted-foreground truncate">{title}</CardTitle>
          {status && (
            <Badge variant="outline" className={`mt-2 ${toneClasses[status.tone]}`}>
              {status.label}
            </Badge>
          )}
        </div>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${accentClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={valueClassName}>{value}</div>
        {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default DashboardMetricCard;
