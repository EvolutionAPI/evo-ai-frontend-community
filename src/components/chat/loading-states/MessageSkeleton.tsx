import React from 'react';

interface MessageSkeletonProps {
  count?: number;
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({ count = 5 }) => {
  // 🎯 PADRÕES FIXOS: Larguras predefinidas para evitar movement
  const messagePatterns = [
    { isOutgoing: false, lines: [75, 45] },
    { isOutgoing: true, lines: [60] },
    { isOutgoing: false, lines: [85, 55, 30] },
    { isOutgoing: false, lines: [70] },
    { isOutgoing: true, lines: [80, 40] },
  ];

  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, index) => {
        const pattern = messagePatterns[index % messagePatterns.length];
        const { isOutgoing, lines } = pattern;

        return (
          <div key={index} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${isOutgoing ? 'bg-primary/20' : 'bg-muted'}`}
            >
              {/* Message content skeleton - LARGURAS FIXAS */}
              <div className="space-y-1">
                {lines.map((width, lineIndex) => (
                  <div
                    key={lineIndex}
                    className="h-4 bg-muted/70 rounded animate-pulse"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>

              {/* Timestamp skeleton */}
              <div className="h-3 w-12 bg-muted/50 rounded animate-pulse mt-2" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
