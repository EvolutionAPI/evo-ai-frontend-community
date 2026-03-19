import { Card, Skeleton } from '@evoapi/design-system';

interface IntegrationLoadingStateProps {
  count?: number;
  type?: 'cards' | 'table' | 'detail';
  className?: string;
}

export default function IntegrationLoadingState({
  count = 6,
  type = 'cards',
  className = ''
}: IntegrationLoadingStateProps) {
  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2 pt-4 border-t">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <Card className={className}>
        <div className="p-6 space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-10 h-10 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (type === 'detail') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-9" />
            <Skeleton className="w-28 h-9" />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-4">
              <Skeleton className="h-6 w-20 mb-3" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}