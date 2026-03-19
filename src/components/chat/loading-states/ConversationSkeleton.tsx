import React from 'react';

interface ConversationSkeletonProps {
  count?: number;
}

const ConversationSkeleton: React.FC<ConversationSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse flex-shrink-0" />

            <div className="flex-1 min-w-0">
              {/* Name skeleton */}
              <div className="h-4 bg-muted rounded animate-pulse mb-2" style={{ width: '60%' }} />

              {/* Message skeleton */}
              <div className="h-3 bg-muted/70 rounded animate-pulse" style={{ width: '80%' }} />
            </div>

            <div className="flex flex-col items-end gap-1">
              {/* Time skeleton */}
              <div className="h-3 w-8 bg-muted/70 rounded animate-pulse" />

              {/* Unread badge skeleton (sometimes) */}
              {index % 3 === 0 && (
                <div className="h-5 w-5 bg-muted/70 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationSkeleton;
