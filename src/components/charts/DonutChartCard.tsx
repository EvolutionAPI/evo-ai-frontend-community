import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@evoapi/design-system';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LucideIcon } from 'lucide-react';
import { TooltipInfo } from '@/components/base/TooltipInfo';

interface DonutChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface DonutChartCardProps {
  title: string;
  description?: string;
  data: DonutChartData[];
  icon?: LucideIcon;
  gradientFrom?: string;
  gradientTo?: string;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
  tooltip?: {
    title: string;
    content: string;
  };
}

const DonutChartCard = ({
  title,
  description,
  data,
  icon: Icon,
  gradientFrom = '#3b82f6',
  gradientTo = '#8b5cf6',
  showLegend = true,
  centerLabel,
  centerValue,
  tooltip,
}: DonutChartCardProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow">
          <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {entry.value}
            </span>
            <Badge variant="secondary" className="text-xs">
              {data[index].value}%
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon && (
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
          )}
          {title}
          {tooltip && <TooltipInfo title={tooltip.title} content={tooltip.content} />}
        </CardTitle>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                {data.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`donut-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1000}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#donut-gradient-${index})`}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend content={<CustomLegend />} />}
            </PieChart>
          </ResponsiveContainer>

          {(centerLabel || centerValue) && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-20px' }}>
              {centerLabel && (
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {centerLabel}
                </div>
              )}
              {centerValue && (
                <div className="text-2xl font-semibold text-foreground">
                  {centerValue}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DonutChartCard;
