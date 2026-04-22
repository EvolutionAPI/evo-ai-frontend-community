import React from 'react';

export const highlightMatch = (text: string | null | undefined, query: string): React.ReactNode => {
  if (!text) return null;
  const trimmed = query.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'ig');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-primary/20 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );
};
